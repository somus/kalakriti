// mutators.ts
import { Zero } from '@/hooks/useZero.ts';
import { createId } from '@paralleldrive/cuid2';
import { Row, Transaction } from '@rocicorp/zero';

import {
	assertIsAdminOrAwardsCoordinator,
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

export function subEventParticipantQuery(z: Zero) {
	return z.query.subEventParticipants
		.related('subEvent', q =>
			q.related('event', q => q.related('coordinators').related('category'))
		)
		.one();
}
export type SubEventParticipant = NonNullable<
	Row<ReturnType<typeof subEventParticipantQuery>>
>;

type MutatorTx = Transaction<Schema>;

export function createSubEventParticipantMutators(
	authData: AuthData | undefined
) {
	return {
		createBatch: async (
			tx: MutatorTx,
			data: CreateBatchSubEventParticipantArgs
		) => {
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
			tx: MutatorTx,
			{ id, groupId }: { id?: string; groupId?: string }
		) => {
			await assertIsEventCoordinatorOfSubEventParticipant(
				tx,
				authData,
				id,
				groupId
			);
			let participant: SubEventParticipant | undefined;
			if (id) {
				participant = await tx.query.subEventParticipants
					.where('id', id)
					.related('subEvent', q =>
						q.related('event', q =>
							q.related('coordinators').related('category')
						)
					)
					.one()
					.run();
			} else if (groupId) {
				participant = await tx.query.subEventParticipants
					.where('groupId', groupId)
					.related('subEvent', q =>
						q.related('event', q =>
							q.related('coordinators').related('category')
						)
					)
					.one()
					.run();
			}
			if (!participant) {
				throw new Error('Invalid participant or group ID provided');
			}

			if (groupId) {
				const groupParticipants = await tx.query.subEventParticipants
					.where('groupId', groupId)
					.run();
				await Promise.all(
					groupParticipants.map(({ id }) =>
						tx.mutate.subEventParticipants.update({
							id,
							attended: !participant.attended
						})
					)
				);
			} else if (id) {
				await tx.mutate.subEventParticipants.update({
					id,
					attended: !participant.attended
				});
			}
		},
		toggleWinner: async (
			tx: MutatorTx,
			{ id, groupId }: { id?: string; groupId?: string }
		) => {
			await assertIsEventCoordinatorOfSubEventParticipant(
				tx,
				authData,
				id,
				groupId
			);
			let participant: SubEventParticipant | undefined;
			if (id) {
				participant = await tx.query.subEventParticipants
					.where('id', id)
					.where('attended', true)
					.related('subEvent', q =>
						q.related('event', q =>
							q.related('coordinators').related('category')
						)
					)
					.one()
					.run();
			} else if (groupId) {
				participant = await tx.query.subEventParticipants
					.where('groupId', groupId)
					.where('attended', true)
					.related('subEvent', q =>
						q.related('event', q =>
							q.related('coordinators').related('category')
						)
					)
					.one()
					.run();
			}
			if (!participant) {
				throw new Error('Invalid participant or group ID provided');
			}
			if (!participant.isWinner) {
				if (participant.isRunner) {
					throw new Error(
						"Can't mark as winner when the current participant is marked as runner up"
					);
				}
				const existingWinners = await tx.query.subEventParticipants
					.where('subEventId', participant.subEventId)
					.where('isWinner', true)
					.run();
				if (existingWinners.length > 0) {
					throw new Error(
						"Can't mark as winner when there are existing winners"
					);
				}
			}

			if (groupId) {
				const groupParticipants = await tx.query.subEventParticipants
					.where('groupId', groupId)
					// eslint-disable-next-line @typescript-eslint/unbound-method
					.where(({ cmp, or }) =>
						or(cmp('isWinner', true), cmp('attended', true))
					)
					.run();
				await Promise.all(
					groupParticipants.map(({ id }) =>
						tx.mutate.subEventParticipants.update({
							id,
							isWinner: !participant.isWinner
						})
					)
				);
			} else if (id) {
				await tx.mutate.subEventParticipants.update({
					id,
					isWinner: !participant.isWinner
				});
			}
		},
		toggleRunnerUp: async (
			tx: MutatorTx,
			{ id, groupId }: { id?: string; groupId?: string }
		) => {
			await assertIsEventCoordinatorOfSubEventParticipant(
				tx,
				authData,
				id,
				groupId
			);
			let participant: SubEventParticipant | undefined;
			if (id) {
				participant = await tx.query.subEventParticipants
					.where('id', id)
					.where('attended', true)
					.related('subEvent', q =>
						q.related('event', q =>
							q.related('coordinators').related('category')
						)
					)
					.one()
					.run();
			} else if (groupId) {
				participant = await tx.query.subEventParticipants
					.where('groupId', groupId)
					.where('attended', true)
					.related('subEvent', q =>
						q.related('event', q =>
							q.related('coordinators').related('category')
						)
					)
					.one()
					.run();
			}
			if (!participant) {
				throw new Error('Invalid participant or group ID provided');
			}
			if (!participant.isRunner) {
				if (participant.isWinner) {
					throw new Error(
						"Can't mark as runner up when the current participant is marked as winner"
					);
				}
				const existingRunnerUps = await tx.query.subEventParticipants
					.where('subEventId', participant.subEventId)
					.where('isRunner', true)
					.run();
				if (existingRunnerUps.length > 0) {
					throw new Error(
						"Can't mark as runner when there are existing runner ups"
					);
				}
			}

			if (groupId) {
				const groupParticipants = await tx.query.subEventParticipants
					.where('groupId', groupId)
					// eslint-disable-next-line @typescript-eslint/unbound-method
					.where(({ cmp, or }) =>
						or(cmp('isRunner', true), cmp('attended', true))
					)
					.run();
				await Promise.all(
					groupParticipants.map(({ id }) =>
						tx.mutate.subEventParticipants.update({
							id,
							isRunner: !participant.isRunner
						})
					)
				);
			} else if (id) {
				await tx.mutate.subEventParticipants.update({
					id,
					isRunner: !participant.isRunner
				});
			}
		},
		togglePrizeAwarded: async (
			tx: MutatorTx,
			{ id, groupId }: { id?: string; groupId?: string }
		) => {
			assertIsAdminOrAwardsCoordinator(authData);
			let participant: SubEventParticipant | undefined;
			if (id) {
				participant = await tx.query.subEventParticipants
					.where('id', id)
					.where('attended', true)
					.related('subEvent', q =>
						q.related('event', q =>
							q.related('coordinators').related('category')
						)
					)
					.one()
					.run();
			} else if (groupId) {
				participant = await tx.query.subEventParticipants
					.where('groupId', groupId)
					.where('attended', true)
					.related('subEvent', q =>
						q.related('event', q =>
							q.related('coordinators').related('category')
						)
					)
					.one()
					.run();
			}
			if (!participant) {
				throw new Error('Invalid participant or group ID provided');
			}
			if (!participant.prizeAwarded) {
				if (!participant.isWinner && !participant.isRunner) {
					throw new Error(
						"Can't mark prize as awarded when the current participant is not marked as winner or runner up"
					);
				}
			}

			if (groupId) {
				const groupParticipants = await tx.query.subEventParticipants
					.where('groupId', groupId)
					// eslint-disable-next-line @typescript-eslint/unbound-method
					.where(({ cmp, or }) =>
						or(cmp('isWinner', true), cmp('isRunner', true))
					)
					.run();
				await Promise.all(
					groupParticipants.map(({ id }) =>
						tx.mutate.subEventParticipants.update({
							id,
							prizeAwarded: !participant.prizeAwarded
						})
					)
				);
			} else if (id) {
				await tx.mutate.subEventParticipants.update({
					id,
					prizeAwarded: !participant.prizeAwarded
				});
			}
		},
		updateSubmissionPhoto: async (
			tx: MutatorTx,
			{ id, submissionPhoto }: { id: string; submissionPhoto: string | null }
		) => {
			await assertIsEventCoordinatorOfSubEventParticipant(tx, authData, id);

			const subEventParticipant = await tx.query.subEventParticipants
				.where('id', id)
				.one()
				.run();

			if (!subEventParticipant) {
				throw new Error('Participant not found');
			}

			await tx.mutate.subEventParticipants.update({
				id,
				submissionPhoto
			});
		},
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			await assertIsAdminOrGuardianOrLiasonOfSubEventParticipant(
				tx,
				authData,
				id
			);
			await tx.mutate.subEventParticipants.delete({ id });
		},
		deleteBatch: async (tx: MutatorTx, { ids }: { ids: string[] }) => {
			await assertIsAdminOrGuardianOrLiasonOfSubEventParticipant(
				tx,
				authData,
				ids[0]
			);
			await Promise.all(
				ids.map(id => tx.mutate.subEventParticipants.delete({ id }))
			);
		},
		deleteByGroupId: async (
			tx: MutatorTx,
			{ groupId }: { groupId: string }
		) => {
			await assertIsAdminOrGuardianOrLiasonOfSubEventParticipantGroup(
				tx,
				authData,
				groupId
			);
			const subEventParticipants = await tx.query.subEventParticipants
				.where('groupId', groupId)
				.run();

			if (subEventParticipants.length === 0) {
				throw new Error('No participants found for group');
			}

			await Promise.all(
				subEventParticipants.map(participant =>
					tx.mutate.subEventParticipants.delete({ id: participant.id })
				)
			);
		}
	} as const;
}
