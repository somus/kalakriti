import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import useZero from '@/hooks/useZero';
import { cn } from '@/lib/utils';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { Ellipsis, QrCodeIcon } from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { User } from 'shared/db/schema.zero';
import { toast } from 'sonner';

import UserFormDialog from './UserFormDialog';

const columnHelper = createColumnHelper<User>();

export const ROLE_STYLES_MAP = {
	admin: 'bg-red-500 border-red-500',
	volunteer: 'bg-teal-500 border-teal-500',
	guardian: 'bg-blue-500 border-blue-500'
} as const;

export const columns = [
	// columnHelper.display({
	// 	id: 'select',
	// 	header: ({ table }) => (
	// 		<Checkbox
	// 			checked={
	// 				table.getIsAllPageRowsSelected() ||
	// 				(table.getIsSomePageRowsSelected() && 'indeterminate')
	// 			}
	// 			onCheckedChange={value => table.toggleAllRowsSelected(!!value)}
	// 			aria-label='Select all'
	// 		/>
	// 	),
	// 	cell: ({ row }) => (
	// 		<Checkbox
	// 			checked={row.getIsSelected()}
	// 			onCheckedChange={value => row.toggleSelected(!!value)}
	// 			aria-label='Select row'
	// 		/>
	// 	),
	// 	enableSorting: false,
	// 	enableHiding: false
	// }),
	columnHelper.accessor(row => row.firstName, {
		id: 'firstName',
		header: ({ column }) => (
			<DataTableColumnHeader
				className='ml-2'
				column={column}
				title='First Name'
			/>
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('firstName')}</div>,
		meta: {
			displayName: 'First Name'
		}
	}),
	columnHelper.accessor(row => row.lastName, {
		id: 'lastName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Last Name' />
		),
		cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
		meta: {
			displayName: 'Last Name'
		}
	}),
	columnHelper.accessor(row => row.role, {
		id: 'role',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Role' />
		),
		cell: ({ row }) => {
			const role = row.getValue<User['role']>('role');

			if (!role) return null;

			return (
				<div className='flex gap-1'>
					<div
						className={cn(
							'flex items-center gap-1 py-1 px-2 rounded-full text-[11px] tracking-[-0.01em] shadow-xs',
							ROLE_STYLES_MAP[role],
							'border-none text-white font-medium'
						)}
					>
						{role}
					</div>
				</div>
			);
		},
		meta: {
			displayName: 'Role'
		}
	}),
	columnHelper.accessor(row => row.email, {
		id: 'email',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Email' />
		),
		cell: ({ row }) => <div>{row.getValue('email')}</div>,
		meta: {
			displayName: 'Email'
		}
	}),
	columnHelper.accessor(row => row.phoneNumber, {
		id: 'phoneNumber',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Phone Number' />
		),
		cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
		meta: {
			displayName: 'Phone Number'
		}
	}),
	{
		id: 'view-qr-code',
		cell: ({ row }: { row: Row<User> }) => {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<Button variant='ghost' size='icon'>
							<QrCodeIcon className='size-4' aria-hidden='true' />
						</Button>
					</DialogTrigger>
					<DialogContent aria-describedby={undefined}>
						<DialogTitle>QR Code</DialogTitle>
						<div
							style={{
								height: 'auto',
								margin: '0 auto',
								maxWidth: 256,
								width: '100%'
							}}
						>
							<QRCode
								size={256}
								style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
								value={JSON.stringify({ type: 'user', id: row.original.id })}
								viewBox={`0 0 256 256`}
							/>
						</div>
					</DialogContent>
				</Dialog>
			);
		},
		size: 32
	},
	{
		id: 'actions',
		cell: ({ row }: { row: Row<User> }) => {
			return <Actions user={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ user }: { user: User }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const z = useZero();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label='Open menu'
					variant='ghost'
					className='flex size-8 p-0 data-[state=open]:bg-muted'
				>
					<Ellipsis className='size-4' aria-hidden='true' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					variant='destructive'
					onSelect={() => {
						z.mutate.users
							.delete({
								id: user.id
							})
							.server.catch((e: Error) => {
								toast.error('Error deleting user', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
			<UserFormDialog
				user={user}
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</DropdownMenu>
	);
};
