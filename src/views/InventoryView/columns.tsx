import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	DropDrawer,
	DropDrawerContent,
	DropDrawerItem,
	DropDrawerTrigger
} from '@/components/ui/dropdrawer';
import { env } from '@/env.client';
import useZero from '@/hooks/useZero';
import { useAuth } from '@clerk/clerk-react';
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
	columnHelper.accessor(row => row.photoPath, {
		id: 'photo',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Photo' />
		),
		cell: ({ row }) => (
			<div className='pl-4'>
				{row.getValue<string>('photo') && (
					<Dialog>
						<DialogTrigger asChild>
							<img
								src={`${import.meta.env.DEV ? 'https://kalakriti.proudindian.ngo' : ''}/cdn-cgi/image/height=80,quality=75/${env.VITE_IMAGE_CDN}/${row.getValue<string>('photo')}`}
								alt={row.getValue('name')}
								className='h-7 object-contain cursor-pointer'
							/>
						</DialogTrigger>
						<DialogTitle className='hidden'>{row.getValue('name')}</DialogTitle>
						<DialogContent
							className='max-w-7xl! border-0 bg-transparent p-0 shadow-none'
							aria-describedby={undefined}
						>
							<div className='relative h-[calc(100vh-220px)] w-full overflow-clip rounded-md bg-transparent'>
								<img
									src={`${import.meta.env.DEV ? 'https://kalakriti.proudindian.ngo' : ''}/cdn-cgi/image/height=800,quality=75/${env.VITE_IMAGE_CDN}/${row.getValue<string>('photo')}`}
									alt={row.getValue('name')}
									className='h-full w-full object-contain'
								/>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		)
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
	const { getToken } = useAuth();

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
							.client.then(async () => {
								if (inventory.photoPath) {
									// Delete photo from R2 bucket
									const token = await getToken();
									await fetch(`${env.VITE_API_SERVER}/deleteAsset`, {
										method: 'DELETE',
										headers: {
											accept: 'application/json',
											Authorization: `Bearer ${token}`
										},
										body: JSON.stringify({
											filePath: inventory.photoPath
										})
									});
								}
							})
							.catch((e: Error) => {
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
