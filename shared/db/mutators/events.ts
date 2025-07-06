// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs, UpdateValue } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateEventArgs {
	id: string;
	name: string;
	coordinatorId: string;
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
		create: async (tx, { timings, ...data }: CreateEventArgs) => {
			assertIsAdmin(authData);
			await tx.mutate.events.insert(data);
			for (const subCategoryId of Object.keys(timings)) {
				const subEvent = timings[subCategoryId];
				if (subEvent.startTime && subEvent.endTime) {
					await tx.mutate.subEvents.insert({
						id: createId(),
						eventId: data.id,
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
				...change
			}: UpdateValue<Schema['tables']['events']> &
				Partial<Pick<CreateEventArgs, 'timings'>>
		) => {
			assertIsAdmin(authData);
			await tx.mutate.events.update(change);
			const event = await tx.query.events
				.where('id', change.id)
				.related('subEvents')
				.one();
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
