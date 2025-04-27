import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { User } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { deleteClerkUser } from '@/lib/clerkUser';
import { defineMeta, filterFn } from '@/lib/filters';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/clerk-react';
import { Row, createColumnHelper } from '@tanstack/react-table';
import {
	Ellipsis,
	Heading1Icon,
	MailIcon,
	Phone,
	QrCodeIcon,
	ShieldUser
} from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';

import UserFormDialog from './UserFormDialog';

const columnHelper = createColumnHelper<User>();

const ROLE_STYLES_MAP = {
	admin: 'bg-red-500 border-red-500',
	volunteer: 'bg-teal-500 border-teal-500',
	guardian: 'bg-blue-500 border-blue-500'
} as const;

export const columns = [
	columnHelper.display({
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={value => table.toggleAllRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={value => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false
	}),
	columnHelper.accessor(row => row.firstName, {
		id: 'firstName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='First Name' />
		),
		cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
		meta: {
			displayName: 'First Name',
			type: 'text',
			icon: Heading1Icon
		},
		filterFn: filterFn('text'),
		sortingFn: 'alphanumeric'
	}),
	columnHelper.accessor(row => row.lastName, {
		id: 'lastName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Last Name' />
		),
		cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
		meta: {
			displayName: 'Last Name',
			type: 'text',
			icon: Heading1Icon
		},
		filterFn: filterFn('text'),
		sortingFn: 'alphanumeric'
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
		filterFn: filterFn('option'),
		meta: defineMeta('role', {
			displayName: 'Role',
			type: 'option',
			icon: ShieldUser,
			transformOptionFn(data) {
				return {
					value: data,
					label: data,
					icon: (
						<div
							className={cn(
								'size-2.5 border-none rounded-full',
								ROLE_STYLES_MAP[data]
							)}
						/>
					)
				};
			}
		})
	}),
	columnHelper.accessor(row => row.email, {
		id: 'email',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Email' />
		),
		cell: ({ row }) => <div>{row.getValue('email')}</div>,
		meta: {
			displayName: 'Email',
			type: 'text',
			icon: MailIcon
		},
		filterFn: filterFn('text')
	}),
	columnHelper.accessor(row => row.phoneNumber, {
		id: 'phoneNumber',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Phone Number' />
		),
		cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
		meta: {
			displayName: 'Phone Number',
			type: 'text',
			icon: Phone
		},
		filterFn: filterFn('text')
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
	const { getToken } = useAuth();
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
						Promise.all([
							z.mutate.users.delete({
								id: user.id
							}),
							deleteClerkUser({ getToken, userId: user.id })
						]).catch(e => {
							console.log('Failed to delete user', e);
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
