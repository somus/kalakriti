import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropDrawer,
	DropDrawerContent,
	DropDrawerItem,
	DropDrawerTrigger
} from '@/components/ui/dropdrawer';
import useZero from '@/hooks/useZero';
import { Row, createColumnHelper } from '@tanstack/react-table';
import startCase from 'lodash/startCase';
import { Ellipsis } from 'lucide-react';
import { toast } from 'sonner';

import { InventoryTransaction } from './InventoryTransactionsView';

const columnHelper = createColumnHelper<InventoryTransaction>();

export const columns = [
	columnHelper.accessor(row => row.inventory?.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Name' />
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('name')}</div>
	}),
	columnHelper.accessor(row => row.quantity, {
		id: 'quantity',
		header: ({ column }) => (
			<DataTableColumnHeader
				className='ml-2'
				column={column}
				title='Quantity'
			/>
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('quantity')}</div>
	}),
	columnHelper.accessor(row => row.type, {
		id: 'type',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Type' />
		),
		cell: ({ row }) => (
			<div className='pl-4'>{startCase(row.getValue('type'))}</div>
		)
	}),
	columnHelper.accessor(row => row.notes, {
		id: 'notes',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Notes' />
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('notes')}</div>
	}),
	columnHelper.accessor(row => row.event, {
		id: 'event',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Event' />
		),
		cell: ({ row }) => {
			const event = row.getValue<InventoryTransaction['event'] | undefined>(
				'event'
			);
			return event ? <Badge variant='outline'>{event.name}</Badge> : null;
		}
	}),
	columnHelper.accessor(row => row.transactor, {
		id: 'transactor',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Volunteer' />
		),
		cell: ({ row }) => {
			const transactor = row.getValue<
				InventoryTransaction['transactor'] | undefined
			>('transactor');
			return transactor ? (
				<Badge variant='outline'>{`${transactor.firstName} ${transactor.lastName}`}</Badge>
			) : null;
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<InventoryTransaction> }) => {
			return <Actions inventoryTransaction={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({
	inventoryTransaction
}: {
	inventoryTransaction: InventoryTransaction;
}) => {
	const z = useZero();

	return (
		<DropDrawer modal={false}>
			<DropDrawerTrigger asChild>
				<Button
					aria-label='Open menu'
					variant='ghost'
					className='flex size-6 p-0 data-[state=open]:bg-muted'
				>
					<Ellipsis className='size-4' aria-hidden='true' />
				</Button>
			</DropDrawerTrigger>
			<DropDrawerContent align='end'>
				<DropDrawerItem
					variant='destructive'
					onSelect={() => {
						z.mutate.inventoryTransactions
							.delete({
								id: inventoryTransaction.id
							})
							.client.catch((e: Error) => {
								toast.error('Error deleting inventory transaction', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
					disabled={
						inventoryTransaction.type === 'initial_inventory' ||
						inventoryTransaction.type === 'adjustment'
					}
				>
					Delete
				</DropDrawerItem>
			</DropDrawerContent>
		</DropDrawer>
	);
};
