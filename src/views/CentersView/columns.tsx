import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Center } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { defineMeta, filterFn } from '@/lib/filters';
import { cn } from '@/lib/utils';
import { Row, createColumnHelper } from '@tanstack/react-table';
import {
	Ellipsis,
	Heading1Icon,
	MailIcon,
	Phone,
	ShieldUser
} from 'lucide-react';
import { useState } from 'react';

import CenterFormDialog from './CenterFormDialog';

const columnHelper = createColumnHelper<Center>();

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
	columnHelper.accessor(row => row.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
		cell: ({ row }) => <div>{row.getValue('name')}</div>,
		meta: {
			displayName: 'Name',
			type: 'text',
			icon: Heading1Icon
		},
		filterFn: filterFn('text'),
		sortingFn: 'alphanumeric'
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
							{liaison.user.firstName} {liaison.user.lastName}
						</Badge>
					))}
				</div>
			);
		},
		filterFn: filterFn('multiOption'),
		enableSorting: false,
		meta: defineMeta('liaisons', {
			displayName: 'Liaisons',
			type: 'option',
			icon: ShieldUser,
			transformOptionFn(data) {
				return {
					value: data.userId,
					label: data.user.firstName + ' ' + data.user.lastName,
					icon: <div className={cn('size-2.5 border-none rounded-full')} />
				};
			}
		})
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
							{guardian.user.firstName} {guardian.user.lastName}
						</Badge>
					))}
				</div>
			);
		},
		filterFn: filterFn('multiOption'),
		enableSorting: false,
		meta: defineMeta('guardians', {
			displayName: 'Guardians',
			type: 'option',
			icon: ShieldUser,
			transformOptionFn(data) {
				return {
					value: data.userId,
					label: data.user.firstName + ' ' + data.user.lastName,
					icon: <div className={cn('size-2.5 border-none rounded-full')} />
				};
			}
		})
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
					variant='destructive'
					onSelect={() => {
						Promise.all([
							z.mutate.centers.delete({
								id: center.id
							})
						]).catch(e => {
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
