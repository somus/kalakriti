// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { Transaction, UpdateValue } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateEventArgs {
	name: string;
	coordinators: string[];
	volunteers: string[];
	eventCategoryId: string;
	allowedGender: 'male' | 'female' | 'both';
	isGroupEvent: boolean;
	minGroupSize?: number | null;
	maxGroupSize?: number | null;
	maxParticipants: number;
	timings: Record<
		string,
		{
			categoryId: string;
			startTime?: number;
			endTime?: number;
		}
	>;
}

type MutatorTx = Transaction<Schema>;

export function createEventMutators(authData: AuthData | undefined) {
	return {
		create: async (
			tx: MutatorTx,
			{
				timings,
				coordinators,
				volunteers,
				minGroupSize,
				maxGroupSize,
				...data
			}: CreateEventArgs
		) => {
			assertIsAdmin(authData);

			if (data.isGroupEvent && (!minGroupSize || !maxGroupSize)) {
				throw new Error('Min and max group size is required');
			}

			const eventId = createId();
			await tx.mutate.events.insert({
				id: eventId,
				minGroupSize: data.isGroupEvent ? minGroupSize : undefined,
				maxGroupSize: data.isGroupEvent ? maxGroupSize : undefined,
				...data
			});
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
			tx: MutatorTx,
			{
				timings,
				coordinators,
				volunteers,
				minGroupSize,
				maxGroupSize,
				...change
			}: UpdateValue<Schema['tables']['events']> &
				Partial<
					Pick<CreateEventArgs, 'timings' | 'coordinators' | 'volunteers'>
				>
		) => {
			assertIsAdmin(authData);

			if (change.isGroupEvent === true && (!minGroupSize || !maxGroupSize)) {
				throw new Error('Min and max group size is required');
			}

			const event = await tx.query.events
				.where('id', change.id)
				.related('coordinators')
				.related('volunteers')
				.related('subEvents')
				.one()
				.run();

			if (!event) {
				throw new Error('Event not found');
			}

			await tx.mutate.events.update({
				...change,
				minGroupSize: !change.isGroupEvent ? null : minGroupSize,
				maxGroupSize: !change.isGroupEvent ? null : maxGroupSize,
				updatedAt: new Date().getTime()
			});

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
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			await tx.mutate.events.delete({ id });
		}
	} as const;
}
