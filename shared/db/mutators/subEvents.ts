// mutators.ts
import { CustomMutatorDefs } from '@rocicorp/zero';

import {
	assertIsAdmin,
	assertIsEventCoordinatorOfSubEvent
} from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export function createSubEventMutators(authData: AuthData | undefined) {
	return {
		updateScoresheetPhoto: async (
			tx,
			{ id, scoresheetPhoto }: { id: string; scoresheetPhoto: string | null }
		) => {
			await assertIsEventCoordinatorOfSubEvent(tx, authData, id);

			const subEvent = await tx.query.subEvents.where('id', id).one();

			if (!subEvent) {
				throw new Error('SubEvent not found');
			}

			await tx.mutate.subEvents.update({
				id,
				scoreSheetPath: scoresheetPhoto
			});
		},
		delete: async (tx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			const subEvent = await tx.query.subEvents
				.where('id', '=', id)
				.related('event', q => q.related('subEvents'))
				.one();
			if (!subEvent) throw new Error('SubEvent not found');

			const isLastSubEvent = subEvent.event?.subEvents?.length === 1;

			if (isLastSubEvent) {
				// Delete the whole event if it's the last sub-event
				await tx.mutate.events.delete({ id: subEvent.event.id });
			} else {
				await tx.mutate.subEvents.delete({ id });
			}
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
