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
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import InventoryFormDialog from './InventoryFormDialog';
import { Inventory } from './InventoryView';

const columnHelper = createColumnHelper<Inventory>();

export const columns = [
	columnHelper.accessor(row => row.name, {
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
	columnHelper.accessor(row => row.unitPrice, {
		id: 'unitPrice',
		header: ({ column }) => (
			<DataTableColumnHeader
				className='ml-2'
				column={column}
				title='Unit Price'
			/>
		),
		cell: ({ row }) => (
			<div className='pl-4'>₹{row.getValue('unitPrice')}.00</div>
		)
	}),
	columnHelper.accessor(row => row.unitPrice * row.quantity, {
		id: 'totalPrice',
		header: ({ column }) => (
			<DataTableColumnHeader
				className='ml-2'
				column={column}
				title='Total Price'
			/>
		),
		cell: ({ row }) => (
			<div className='pl-4'>₹{row.getValue('totalPrice')}.00</div>
		)
	}),
	columnHelper.accessor(row => row.event, {
		id: 'event',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Event' />
		),
		cell: ({ row }) => {
			const event = row.getValue<Inventory['event'] | undefined>('event');
			return event ? <Badge variant='outline'>{event.name}</Badge> : null;
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<Inventory> }) => {
			return <Actions inventory={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ inventory }: { inventory: Inventory }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
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
				<DropDrawerItem onSelect={() => setIsDialogOpen(true)}>
					Edit
				</DropDrawerItem>
				<DropDrawerItem
					variant='destructive'
					onSelect={() => {
						z.mutate.inventory
							.delete({
								id: inventory.id
							})
							.client.catch((e: Error) => {
								toast.error('Error deleting inventory', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					Delete
				</DropDrawerItem>
			</DropDrawerContent>
			{isDialogOpen && (
				<InventoryFormDialog
					inventory={inventory}
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				/>
			)}
		</DropDrawer>
	);
};
