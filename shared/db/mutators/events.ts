// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs, UpdateValue } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateEventArgs {
	name: string;
	coordinators: string[];
	volunteers: string[];
	eventCategoryId: string;
	timings: Record<
		string,
		{
			categoryId: string;
			startTime?: number;
			endTime?: number;
		}
	>;
}

export function createEventMutators(authData: AuthData | undefined) {
	return {
		create: async (
			tx,
			{ timings, coordinators, volunteers, ...data }: CreateEventArgs
		) => {
			assertIsAdmin(authData);
			const eventId = createId();
			await tx.mutate.events.insert({ id: eventId, ...data });
			for (const coordinatorId of coordinators) {
				await tx.mutate.eventCoordinators.insert({
					eventId: eventId,
					userId: coordinatorId
				});
			}
			for (const volunteerId of volunteers) {
				await tx.mutate.eventVolunteers.insert({
					eventId: eventId,
					userId: volunteerId
				});
			}
			for (const subCategoryId of Object.keys(timings)) {
				const subEvent = timings[subCategoryId];
				if (subEvent.startTime && subEvent.endTime) {
					await tx.mutate.subEvents.insert({
						id: createId(),
						eventId: eventId,
						participantCategoryId: subEvent.categoryId,
						startTime: subEvent.startTime,
						endTime: subEvent.endTime
					});
				}
			}
		},
		update: async (
			tx,
			{
				timings,
				coordinators,
				volunteers,
				...change
			}: UpdateValue<Schema['tables']['events']> &
				Partial<
					Pick<CreateEventArgs, 'timings' | 'coordinators' | 'volunteers'>
				>
		) => {
			assertIsAdmin(authData);

			const event = await tx.query.events
				.where('id', change.id)
				.related('coordinators')
				.related('volunteers')
				.related('subEvents')
				.one();

			if (!event) {
				throw new Error('Event not found');
			}

			await tx.mutate.events.update(change);

			if (coordinators) {
				const currentCoordinatorIds = event.coordinators.map(
					coordinator => coordinator.userId
				);

				// Determine which coordinators to remove and which to add
				const coordinatorsToRemove = currentCoordinatorIds.filter(
					id => !coordinators.includes(id)
				);
				const coordinatorsToAdd = coordinators?.filter(
					id => !currentCoordinatorIds.includes(id)
				);

				// Remove deleted coordinators
				for (const userId of coordinatorsToRemove) {
					await tx.mutate.eventCoordinators.delete({
						eventId: event.id,
						userId
					});
				}

				// Add new coordinators
				for (const userId of coordinatorsToAdd) {
					await tx.mutate.eventCoordinators.insert({
						eventId: event.id,
						userId
					});
				}
			}

			if (volunteers) {
				const currentVolunteerIds = event.volunteers.map(
					volunteer => volunteer.userId
				);

				// Determine which volunteers to remove and which to add
				const volunteersToRemove = currentVolunteerIds.filter(
					id => !volunteers.includes(id)
				);
				const volunteersToAdd = volunteers?.filter(
					id => !currentVolunteerIds.includes(id)
				);

				// Remove deleted volunteers
				for (const userId of volunteersToRemove) {
					await tx.mutate.eventVolunteers.delete({
						eventId: event.id,
						userId
					});
				}

				// Add new volunteers
				for (const userId of volunteersToAdd) {
					await tx.mutate.eventVolunteers.insert({
						eventId: event.id,
						userId
					});
				}
			}

			if (timings && event) {
				const existingSubEventIds = event.subEvents.map(
					subEvent => subEvent.id
				);
				for (const subCategoryId of Object.keys(timings)) {
					const subEvent = timings[subCategoryId];
					if (subEvent.startTime && subEvent.endTime) {
						if (existingSubEventIds.includes(subCategoryId)) {
							await tx.mutate.subEvents.update({
								id: subCategoryId,
								startTime: subEvent.startTime,
								endTime: subEvent.endTime
							});
						} else {
							await tx.mutate.subEvents.insert({
								id: createId(),
								eventId: event.id,
								participantCategoryId: subEvent.categoryId,
								startTime: subEvent.startTime,
								endTime: subEvent.endTime
							});
						}
					}
				}
			}
		},
		delete: async (tx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			await tx.mutate.events.delete({ id });
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
