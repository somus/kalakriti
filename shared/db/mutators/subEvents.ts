// mutators.ts
import { CustomMutatorDefs } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export function createSubEventMutators(authData: AuthData | undefined) {
	return {
		delete: async (tx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			await tx.mutate.subEvents.delete({ id });
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
