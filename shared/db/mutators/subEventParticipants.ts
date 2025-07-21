// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs } from '@rocicorp/zero';

import {
	assertIsAdminOrGuardianOrLiasonOfParticipant,
	assertIsAdminOrGuardianOrLiasonOfSubEventParticipant,
	assertIsAdminOrGuardianOrLiasonOfSubEventParticipantGroup
} from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateBatchSubEventParticipantArgs {
	participantIds: string[];
	subEventId: string;
	groupId?: string;
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
					subEventId: data.subEventId,
					groupId: data.groupId
				});
			}
		},
		delete: async (tx, { id }: { id: string }) => {
			await assertIsAdminOrGuardianOrLiasonOfSubEventParticipant(
				tx,
				authData,
				id
			);
			await tx.mutate.subEventParticipants.delete({ id });
		},
		deleteBatch: async (tx, { ids }: { ids: string[] }) => {
			await assertIsAdminOrGuardianOrLiasonOfSubEventParticipant(
				tx,
				authData,
				ids[0]
			);
			await Promise.all(
				ids.map(id => tx.mutate.subEventParticipants.delete({ id }))
			);
		},
		deleteByGroupId: async (tx, { groupId }: { groupId: string }) => {
			await assertIsAdminOrGuardianOrLiasonOfSubEventParticipantGroup(
				tx,
				authData,
				groupId
			);
			const subEventParticipants = await tx.query.subEventParticipants.where(
				'groupId',
				groupId
			);

			if (subEventParticipants.length === 0) {
				throw new Error('No participants found for group');
			}

			await Promise.all(
				subEventParticipants.map(participant =>
					tx.mutate.subEventParticipants.delete({ id: participant.id })
				)
			);
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
