import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import InventoryTransactionsFormDialog from './InventoryTransactionsFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function inventoryTransactionsQuery(z: Zero) {
	return z.query.inventoryTransactions
		.related('events', q => q.related('event'))
		.related('inventory')
		.related('transactor')
		.orderBy('createdAt', 'desc');
}

export type InventoryTransaction = Row<
	ReturnType<typeof inventoryTransactionsQuery>
>;

export default function InventoryTransactionsView() {
	'use no memo';
	const z = useZero();
	const [inventoryTransactions, status] = useQuery(
		inventoryTransactionsQuery(z)
	);

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!inventoryTransactions) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load inventory transactions</p>
				</p>
			</div>
		);
	}

	return (
		<DataTableWrapper
			data={inventoryTransactions as InventoryTransaction[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				<InventoryTransactionsFormDialog key='create-inventory-transaction'>
					<Button className='h-7'>Create Inventory Transaction</Button>
				</InventoryTransactionsFormDialog>
			]}
		/>
	);
}
