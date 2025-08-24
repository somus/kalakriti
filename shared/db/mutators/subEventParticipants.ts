// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs } from '@rocicorp/zero';

import {
	assertIsAdminOrGuardianOrLiasonOfParticipant,
	assertIsAdminOrGuardianOrLiasonOfSubEventParticipant,
	assertIsAdminOrGuardianOrLiasonOfSubEventParticipantGroup,
	assertIsEventCoordinatorOfSubEventParticipant
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
		toggleAttendance: async (
			tx,
			{ id, groupId }: { id: string; groupId?: string }
		) => {
			await assertIsEventCoordinatorOfSubEventParticipant(
				tx,
				authData,
				id,
				groupId
			);
			const participant = await tx.query.subEventParticipants
				.where('id', id)
				.related('subEvent', q => q.related('event'))
				.one();
			if (!participant || participant.groupId !== groupId) {
				throw new Error('Invalid participant ID provided');
			}

			if (groupId) {
				const groupParticipants = await tx.query.subEventParticipants.where(
					'groupId',
					groupId
				);
				await Promise.all(
					groupParticipants.map(({ id }) =>
						tx.mutate.subEventParticipants.update({
							id,
							attended: !participant.attended
						})
					)
				);
			} else {
				await tx.mutate.subEventParticipants.update({
					id,
					attended: !participant.attended
				});
			}
		},
		toggleWinner: async (
			tx,
			{ id, groupId }: { id: string; groupId?: string }
		) => {
			await assertIsEventCoordinatorOfSubEventParticipant(
				tx,
				authData,
				id,
				groupId
			);
			const participant = await tx.query.subEventParticipants
				.where('id', id)
				.related('subEvent', q => q.related('event'))
				.one();
			if (!participant || participant.groupId !== groupId) {
				throw new Error('Invalid participant ID provided');
			}
			if (!participant.isWinner) {
				if (participant.isRunner) {
					throw new Error(
						"Can't mark as winner when the current participant is marked as runner up"
					);
				}
				const existingWinners = await tx.query.subEventParticipants
					.where('subEventId', participant.subEventId)
					.where('isWinner', true);
				if (existingWinners.length > 0) {
					throw new Error(
						"Can't mark as winner when there are existing winners"
					);
				}
			}

			if (groupId) {
				const groupParticipants = await tx.query.subEventParticipants.where(
					'groupId',
					groupId
				);
				await Promise.all(
					groupParticipants.map(({ id }) =>
						tx.mutate.subEventParticipants.update({
							id,
							isWinner: !participant.isWinner
						})
					)
				);
			} else {
				await tx.mutate.subEventParticipants.update({
					id,
					isWinner: !participant.isWinner
				});
			}
		},
		toggleRunnerUp: async (
			tx,
			{ id, groupId }: { id: string; groupId?: string }
		) => {
			await assertIsEventCoordinatorOfSubEventParticipant(
				tx,
				authData,
				id,
				groupId
			);
			const participant = await tx.query.subEventParticipants
				.where('id', id)
				.related('subEvent', q => q.related('event'))
				.one();
			if (!participant || participant.groupId !== groupId) {
				throw new Error('Invalid participant ID provided');
			}
			if (!participant.isRunner) {
				if (participant.isWinner) {
					throw new Error(
						"Can't mark as runner up when the current participant is marked as winner"
					);
				}
				const existingRunnerUps = await tx.query.subEventParticipants
					.where('subEventId', participant.subEventId)
					.where('isRunner', true);
				if (existingRunnerUps.length > 0) {
					throw new Error(
						"Can't mark as runner when there are existing runner ups"
					);
				}
			}

			if (groupId) {
				const groupParticipants = await tx.query.subEventParticipants.where(
					'groupId',
					groupId
				);
				await Promise.all(
					groupParticipants.map(({ id }) =>
						tx.mutate.subEventParticipants.update({
							id,
							isRunner: !participant.isRunner
						})
					)
				);
			} else {
				await tx.mutate.subEventParticipants.update({
					id,
					isRunner: !participant.isRunner
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
