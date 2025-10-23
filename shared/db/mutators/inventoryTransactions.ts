// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { Transaction } from '@rocicorp/zero';

import { assertIsAdminOrLogisticsCoordinator } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateInventoryTransactionArgs {
	quantity: number;
	inventoryId: string;
	type:
		| 'initial_inventory'
		| 'purchase'
		| 'adjustment'
		| 'event_return'
		| 'event_dispatch';
	notes?: string;
	events: string[];
	transactorId?: string;
}

type MutatorTx = Transaction<Schema>;

export function createInventoryTransactionMutators(
	authData: AuthData | undefined
) {
	return {
		create: async (
			tx: MutatorTx,
			{ events, ...data }: CreateInventoryTransactionArgs
		) => {
			assertIsAdminOrLogisticsCoordinator(authData);
			const inventory = await tx.query.inventory
				.where('id', data.inventoryId)
				.one()
				.run();

			if (!inventory) {
				throw new Error('Inventory not found');
			}

			if (data.type === 'initial_inventory') {
				throw new Error('Initial inventory cannot be created manually');
			}

			const inventoryTransactionId = createId();
			await tx.mutate.inventoryTransactions.insert({
				id: inventoryTransactionId,
				notes: data.notes,
				inventoryId: inventory.id,
				type: data.type,
				quantity: data.quantity,
				transactorId: data.transactorId
			});
			for (const eventId of events) {
				await tx.mutate.inventoryTransactionEvents.insert({
					inventoryTransactionId: inventoryTransactionId,
					eventId: eventId
				});
			}
			let quantity = inventory.quantity;
			if (data.type === 'event_dispatch') {
				quantity -= data.quantity;
			} else if (data.type === 'event_return' || data.type === 'purchase') {
				quantity += data.quantity;
			} else {
				quantity = data.quantity;
			}

			if (quantity < 0) {
				throw new Error('Inventory quantity cannot be negative');
			}

			await tx.mutate.inventory.update({
				id: inventory.id,
				quantity: quantity
			});
		},
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			assertIsAdminOrLogisticsCoordinator(authData);
			const inventoryTransaction = await tx.query.inventoryTransactions
				.where('id', id)
				.related('inventory')
				.one()
				.run();

			if (!inventoryTransaction) {
				throw new Error('Inventory transaction not found');
			}

			await tx.mutate.inventory.update({
				id: inventoryTransaction.inventoryId,
				quantity:
					inventoryTransaction.inventory!.quantity -
					inventoryTransaction.quantity
			});

			await tx.mutate.inventoryTransactions.delete({ id });
		}
	} as const;
}
