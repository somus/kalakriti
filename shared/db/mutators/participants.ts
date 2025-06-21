// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs, UpdateValue } from '@rocicorp/zero';
import { differenceInYears } from 'date-fns';

import { assertIsAdminOrGuardianOrLiasonOfCenter } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateParticipantArgs {
	name: string;
	dob: number;
	gender: 'male' | 'female';
	centerId: string;
}

export function createParticipantMutators(authData: AuthData | undefined) {
	return {
		create: async (tx, data: CreateParticipantArgs) => {
			await assertIsAdminOrGuardianOrLiasonOfCenter(
				tx,
				authData,
				data.centerId
			);
			const age = differenceInYears(new Date(), data.dob);
			const participantCategories = await tx.query.participantCategories;
			const participantCategory = participantCategories.find(
				category => category.minAge <= age && category.maxAge >= age
			);
			if (!participantCategory) {
				throw new Error('Participant category not found');
			}
			const participants = await tx.query.participants;
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
			tx,
			change: UpdateValue<Schema['tables']['participants']>
		) => {
			const participant = await tx.query.participants
				.where('id', change.id)
				.one();
			if (!participant) {
				throw new Error('Participant not found');
			}
			await assertIsAdminOrGuardianOrLiasonOfCenter(
				tx,
				authData,
				participant?.centerId
			);
			await tx.mutate.participants.update(change);
		},
		delete: async (tx, { id }: { id: string }) => {
			const participant = await tx.query.participants.where('id', id).one();
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
	} as const satisfies CustomMutatorDefs<Schema>;
}
