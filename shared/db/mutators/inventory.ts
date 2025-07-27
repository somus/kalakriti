// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs, UpdateValue } from '@rocicorp/zero';

import { assertIsAdminOrLogisticsCoordinator } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateInventoryArgs {
	name: string;
	quantity: number;
	unitPrice: number;
	eventId?: string;
}

export function createInventoryMutators(authData: AuthData | undefined) {
	return {
		create: async (tx, data: CreateInventoryArgs) => {
			assertIsAdminOrLogisticsCoordinator(authData);
			await tx.mutate.inventory.insert({ id: createId(), ...data });
		},
		update: async (
			tx,
			change: Omit<
				UpdateValue<Schema['tables']['inventory']>,
				'quantity' | 'createdAt'
			>
		) => {
			assertIsAdminOrLogisticsCoordinator(authData);
			await tx.mutate.inventory.update({
				...change,
				updatedAt: new Date().getTime()
			});
		},
		delete: async (tx, { id }: { id: string }) => {
			assertIsAdminOrLogisticsCoordinator(authData);
			await tx.mutate.inventory.delete({ id });
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
