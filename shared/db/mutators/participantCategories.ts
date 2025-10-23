// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { Transaction, UpdateValue } from '@rocicorp/zero';

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

type MutatorTx = Transaction<Schema>;

export function createParticipantCategoryMutators(
	authData: AuthData | undefined
) {
	return {
		create: async (tx: MutatorTx, data: CreateParticipantCategoryArgs) => {
			assertIsAdmin(authData);
			await tx.mutate.participantCategories.insert({ id: createId(), ...data });
		},
		update: async (
			tx: MutatorTx,
			change: UpdateValue<Schema['tables']['participantCategories']>
		) => {
			assertIsAdmin(authData);
			await tx.mutate.participantCategories.update({
				...change,
				updatedAt: new Date().getTime()
			});
		},
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			await tx.mutate.participantCategories.delete({ id });
		}
	} as const;
}
