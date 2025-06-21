// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs, UpdateValue } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateEventCategoryArgs {
	name: string;
	coordinatorId?: string | null;
}

export function createEventCategoryMutators(authData: AuthData | undefined) {
	return {
		create: async (tx, data: CreateEventCategoryArgs) => {
			assertIsAdmin(authData);
			await tx.mutate.eventCategories.insert({ id: createId(), ...data });
		},
		update: async (
			tx,
			change: UpdateValue<Schema['tables']['eventCategories']>
		) => {
			assertIsAdmin(authData);
			await tx.mutate.eventCategories.update(change);
		},
		delete: async (tx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			await tx.mutate.eventCategories.delete({ id });
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
