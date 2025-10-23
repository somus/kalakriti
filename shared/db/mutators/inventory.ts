// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { Transaction, UpdateValue } from '@rocicorp/zero';

import { assertIsAdminOrLogisticsCoordinator } from '../permissions.ts';
import { inventoryTransactionType } from '../schema.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateInventoryArgs {
	name: string;
	quantity: number;
	unitPrice: number;
	events: string[];
	photoPath?: string;
}

type MutatorTx = Transaction<Schema>;

export function createInventoryMutators(authData: AuthData | undefined) {
	return {
		create: async (tx: MutatorTx, { events, ...data }: CreateInventoryArgs) => {
			assertIsAdminOrLogisticsCoordinator(authData);
			const inventoryId = createId();
			await tx.mutate.inventory.insert({ id: inventoryId, ...data });
			for (const eventId of events) {
				await tx.mutate.inventoryEvents.insert({
					inventoryId: inventoryId,
					eventId: eventId
				});
			}
			const inventoryTransactionId = createId();
			await tx.mutate.inventoryTransactions.insert({
				id: inventoryTransactionId,
				inventoryId,
				type: inventoryTransactionType.enumValues[0],
				quantity: data.quantity
			});
			for (const eventId of events) {
				await tx.mutate.inventoryTransactionEvents.insert({
					inventoryTransactionId: inventoryTransactionId,
					eventId: eventId
				});
			}
		},
		update: async (
			tx: MutatorTx,
			{
				photoPath,
				events,
				...change
			}: Omit<
				UpdateValue<Schema['tables']['inventory']>,
				'quantity' | 'eventId' | 'createdAt'
			> &
				Partial<Pick<CreateInventoryArgs, 'events'>>
		) => {
			assertIsAdminOrLogisticsCoordinator(authData);
			const inventory = await tx.query.inventory
				.where('id', change.id)
				.related('events')
				.one()
				.run();

			if (!inventory) {
				throw new Error('Inventory not found');
			}

			await tx.mutate.inventory.update({
				...change,
				photoPath,
				updatedAt: new Date().getTime()
			});

			if (events) {
				const currentEventIds = inventory.events.map(event => event.eventId);

				// Determine which events to remove and which to add
				const eventsToRemove = currentEventIds.filter(
					id => !events?.includes(id)
				);
				const eventsToAdd = events?.filter(id => !currentEventIds.includes(id));

				// Remove deleted events
				for (const eventId of eventsToRemove) {
					await tx.mutate.inventoryEvents.delete({
						inventoryId: inventory.id,
						eventId
					});
				}

				// Add new events
				for (const eventId of eventsToAdd) {
					await tx.mutate.inventoryEvents.insert({
						inventoryId: inventory.id,
						eventId
					});
				}
			}
		},
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			assertIsAdminOrLogisticsCoordinator(authData);
			await tx.mutate.inventory.delete({ id });
		}
	} as const;
}
