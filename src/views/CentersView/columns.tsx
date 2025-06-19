import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import useZero from '@/hooks/useZero';
import { Center } from '@/layout/CenterLayout';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { Ellipsis, LinkIcon, LockIcon, LockOpenIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import CenterFormDialog from './CenterFormDialog';

const columnHelper = createColumnHelper<Center>();

export const columns = [
	columnHelper.display({
		id: 'select',
		header: () => null,
		cell: ({ row }) => (
			<Button
				aria-label='View center'
				variant='ghost'
				className='flex size-8 p-0 data-[state=open]:bg-muted'
				asChild
			>
				<Link to={`/centers/${row.original.id}`}>
					<LinkIcon className='size-4' />
				</Link>
			</Button>
		),
		enableSorting: false,
		enableHiding: false
	}),
	columnHelper.accessor(row => row.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
		cell: ({ row }) => <div>{row.getValue('name')}</div>
	}),
	columnHelper.accessor(row => row.email, {
		id: 'email',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Email' />
		),
		cell: ({ row }) => <div>{row.getValue('email')}</div>
	}),
	columnHelper.accessor(row => row.phoneNumber, {
		id: 'phoneNumber',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Phone Number' />
		),
		cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>
	}),
	columnHelper.accessor(row => row.liaisons, {
		id: 'liaisons',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Liaisons' />
		),
		cell: ({ row }) => {
			const liaisons = row.getValue<Center['liaisons']>('liaisons');

			if (liaisons?.length === 0) return null;

			return (
				<div className='flex gap-1'>
					{liaisons.map(liaison => (
						<Badge variant='outline' key={liaison.userId}>
							{liaison.user?.firstName} {liaison.user?.lastName}
						</Badge>
					))}
				</div>
			);
		},
		enableSorting: false
	}),
	columnHelper.accessor(row => row.guardians, {
		id: 'guardians',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Guardians' />
		),
		cell: ({ row }) => {
			const guardians = row.getValue<Center['guardians']>('guardians');

			if (guardians?.length === 0) return null;

			return (
				<div className='flex gap-1'>
					{guardians.map(guardian => (
						<Badge variant='outline' key={guardian.userId}>
							{guardian.user?.firstName} {guardian.user?.lastName}
						</Badge>
					))}
				</div>
			);
		},
		enableSorting: false
	}),
	columnHelper.accessor(row => (row.isLocked ?? false).toString(), {
		id: 'isLocked',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Locked' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{row.getValue('isLocked') === 'true' ? (
					<LockIcon className='size-5' />
				) : (
					<LockOpenIcon className='size-5' />
				)}
			</div>
		),
		meta: {
			displayName: 'Locked'
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<Center> }) => {
			return <Actions center={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ center }: { center: Center }) => {
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
					onSelect={() => {
						z.mutate.centers
							.update({
								id: center.id,
								isLocked: !center.isLocked
							})
							.catch(e => {
								console.log('Failed to update center', e);
							});
					}}
				>
					{center.isLocked ? 'Unlock' : 'Lock'}
				</DropdownMenuItem>
				<DropdownMenuItem
					variant='destructive'
					onSelect={() => {
						z.mutate.centers
							.delete({
								id: center.id
							})
							.catch(e => {
								console.log('Failed to delete center', e);
							});
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
			<CenterFormDialog
				center={center}
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</DropdownMenu>
	);
};
