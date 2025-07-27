import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero, { Zero } from '@/hooks/useZero';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import InventoryTransactionsFormDialog from './InventoryTransactionsFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function inventoryTransactionsQuery(z: Zero) {
	return z.query.inventoryTransactions
		.related('event')
		.related('inventory')
		.orderBy('createdAt', 'desc');
}

export type InventoryTransaction = Row<
	ReturnType<typeof inventoryTransactionsQuery>
>;

export default function InventoryTransactionsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [inventoryTransactions, status] = useQuery(
		inventoryTransactionsQuery(z)
	);

	if (status.type !== 'complete') {
		return null;
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
