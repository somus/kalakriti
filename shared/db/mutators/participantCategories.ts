// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs, UpdateValue } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateParticipantCategoryArgs {
	name: string;
	minAge: number;
	maxAge: number;
	maxBoys: number;
	maxGirls: number;
	totalEventsAllowed: number;
	maxEventsPerCategory: number;
}

export function createParticipantCategoryMutators(
	authData: AuthData | undefined
) {
	return {
		create: async (tx, data: CreateParticipantCategoryArgs) => {
			assertIsAdmin(authData);
			await tx.mutate.participantCategories.insert({ id: createId(), ...data });
		},
		update: async (
			tx,
			change: UpdateValue<Schema['tables']['participantCategories']>
		) => {
			assertIsAdmin(authData);
			await tx.mutate.participantCategories.update({
				...change,
				updatedAt: new Date().getTime()
			});
		},
		delete: async (tx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			await tx.mutate.participantCategories.delete({ id });
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
