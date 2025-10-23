import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import InventoryFormDialog from './InventoryFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function inventoryQuery(z: Zero) {
	return z.query.inventory
		.related('events', q => q.related('event'))
		.orderBy('createdAt', 'desc');
}

export type Inventory = Row<ReturnType<typeof inventoryQuery>>;

export default function InventoryView() {
	'use no memo';
	const z = useZero();
	const [inventory, status] = useQuery(inventoryQuery(z));

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!inventory) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load inventory</p>
				</p>
			</div>
		);
	}

	return (
		<DataTableWrapper
			data={inventory as Inventory[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				<InventoryFormDialog key='create-inventory'>
					<Button className='h-7'>Create Inventory</Button>
				</InventoryFormDialog>
			]}
		/>
	);
}
