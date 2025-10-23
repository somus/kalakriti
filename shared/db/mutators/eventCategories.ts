// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { Transaction, UpdateValue } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateEventCategoryArgs {
	name: string;
	coordinatorId?: string | null;
}

type MutatorTx = Transaction<Schema>;

export function createEventCategoryMutators(authData: AuthData | undefined) {
	return {
		create: async (tx: MutatorTx, data: CreateEventCategoryArgs) => {
			assertIsAdmin(authData);
			await tx.mutate.eventCategories.insert({ id: createId(), ...data });
		},
		update: async (
			tx: MutatorTx,
			change: UpdateValue<Schema['tables']['eventCategories']>
		) => {
			assertIsAdmin(authData);
			await tx.mutate.eventCategories.update({
				...change,
				updatedAt: new Date().getTime()
			});
		},
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			await tx.mutate.eventCategories.delete({ id });
		}
	} as const;
}
