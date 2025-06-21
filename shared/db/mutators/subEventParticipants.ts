// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs } from '@rocicorp/zero';

import { assertIsAdminOrGuardianOrLiasonOfParticipant } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateBatchSubEventParticipantArgs {
	participantIds: string[];
	subEventId: string;
}

export function createSubEventParticipantMutators(
	authData: AuthData | undefined
) {
	return {
		createBatch: async (tx, data: CreateBatchSubEventParticipantArgs) => {
			if (data.participantIds.length === 0) {
				throw new Error('No participant IDs provided');
			}
			await assertIsAdminOrGuardianOrLiasonOfParticipant(
				tx,
				authData,
				data.participantIds[0]
			);
			for (const participantId of data.participantIds) {
				await tx.mutate.subEventParticipants.insert({
					id: createId(),
					participantId,
					subEventId: data.subEventId
				});
			}
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
