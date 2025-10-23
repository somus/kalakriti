// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { Transaction, UpdateValue } from '@rocicorp/zero';
import { differenceInYears } from 'date-fns';

import {
	assertIsAdminOrFoodCoordinator,
	assertIsAdminOrGuardianOrLiasonOfCenter,
	assertIsAdminOrLiasonOfCenter
} from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateParticipantArgs {
	name: string;
	dob: number;
	gender: 'male' | 'female';
	centerId: string;
}

type MutatorTx = Transaction<Schema>;

export function createParticipantMutators(authData: AuthData | undefined) {
	return {
		create: async (tx: MutatorTx, data: CreateParticipantArgs) => {
			await assertIsAdminOrGuardianOrLiasonOfCenter(
				tx,
				authData,
				data.centerId
			);
			const age = differenceInYears(new Date(), data.dob);
			const participantCategories = await tx.query.participantCategories.run();
			const participantCategory = participantCategories.find(
				category => category.minAge <= age && category.maxAge >= age
			);
			if (!participantCategory) {
				throw new Error('Participant category not found');
			}
			const participants = await tx.query.participants
				.where('centerId', data.centerId)
				.run();
			const exisitngParticipantsInCategory = participants.filter(
				p =>
					p.gender === data.gender &&
					p.participantCategoryId === participantCategory.id
			).length;
			if (
				exisitngParticipantsInCategory >=
				(data.gender === 'male'
					? participantCategory.maxBoys
					: participantCategory.maxGirls)
			) {
				throw new Error(
					`Maximum number of ${data.gender} participants added for ${participantCategory.name} category`
				);
			}

			// Create the participant in db
			await tx.mutate.participants.insert({
				id: createId(),
				...data,
				age,
				participantCategoryId: participantCategory.id
			});
		},
		update: async (
			tx: MutatorTx,
			change: UpdateValue<Schema['tables']['participants']>
		) => {
			const participant = await tx.query.participants
				.where('id', change.id)
				.one()
				.run();
			if (!participant) {
				throw new Error('Participant not found');
			}
			await assertIsAdminOrGuardianOrLiasonOfCenter(
				tx,
				authData,
				participant?.centerId
			);
			await tx.mutate.participants.update({
				...change,
				updatedAt: new Date().getTime()
			});
		},
		togglePickedUp: async (tx: MutatorTx, id: string) => {
			const participant = await tx.query.participants
				.where('id', id)
				.one()
				.run();
			if (!participant) {
				throw new Error('Participant not found');
			}

			await assertIsAdminOrLiasonOfCenter(tx, authData, participant?.centerId);

			await tx.mutate.participants.update({
				id,
				pickedUp: !participant.pickedUp,
				updatedAt: new Date().getTime()
			});
		},
		toggleLeftVenue: async (tx: MutatorTx, id: string) => {
			const participant = await tx.query.participants
				.where('id', id)
				.one()
				.run();
			if (!participant) {
				throw new Error('Participant not found');
			}

			await assertIsAdminOrLiasonOfCenter(tx, authData, participant?.centerId);

			await tx.mutate.participants.update({
				id,
				leftVenue: !participant.leftVenue,
				updatedAt: new Date().getTime()
			});
		},
		toggleDroppedOff: async (tx: MutatorTx, id: string) => {
			const participant = await tx.query.participants
				.where('id', id)
				.one()
				.run();
			if (!participant) {
				throw new Error('Participant not found');
			}

			await assertIsAdminOrLiasonOfCenter(tx, authData, participant?.centerId);

			await tx.mutate.participants.update({
				id,
				droppedOff: !participant.droppedOff,
				updatedAt: new Date().getTime()
			});
		},
		toggleHadBreakfast: async (tx: MutatorTx, id: string) => {
			assertIsAdminOrFoodCoordinator(authData);

			const participant = await tx.query.participants
				.where('id', id)
				.one()
				.run();
			if (!participant) {
				throw new Error('Participant not found');
			}

			await tx.mutate.participants.update({
				id,
				hadBreakfast: !participant.hadBreakfast,
				updatedAt: new Date().getTime()
			});
		},
		toggleHadLunch: async (tx: MutatorTx, id: string) => {
			assertIsAdminOrFoodCoordinator(authData);

			const participant = await tx.query.participants
				.where('id', id)
				.one()
				.run();
			if (!participant) {
				throw new Error('Participant not found');
			}

			await tx.mutate.participants.update({
				id,
				hadLunch: !participant.hadLunch,
				updatedAt: new Date().getTime()
			});
		},
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			const participant = await tx.query.participants
				.where('id', id)
				.one()
				.run();
			if (!participant) {
				throw new Error('Participant not found');
			}
			await assertIsAdminOrGuardianOrLiasonOfCenter(
				tx,
				authData,
				participant?.centerId
			);
			await tx.mutate.participants.delete({ id });
		}
	} as const;
}
