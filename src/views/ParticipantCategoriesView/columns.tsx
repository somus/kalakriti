import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ParticipantCategory } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { filterFn } from '@/lib/filters';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { Ellipsis, HashIcon, Heading1Icon } from 'lucide-react';
import { useState } from 'react';

import ParticipantCategoryFormDialog from './ParticipantCategoryFormDialog';

const columnHelper = createColumnHelper<ParticipantCategory>();

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
	columnHelper.accessor(row => row.minAge, {
		id: 'minAge',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Min Age' />
		),
		cell: ({ row }) => <div>{row.getValue('minAge')}</div>,
		meta: {
			displayName: 'Min Age',
			type: 'number',
			icon: HashIcon
		},
		filterFn: filterFn('number'),
		sortingFn: 'alphanumeric'
	}),
	columnHelper.accessor(row => row.maxAge, {
		id: 'maxAge',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Max Age' />
		),
		cell: ({ row }) => <div>{row.getValue('maxAge')}</div>,
		meta: {
			displayName: 'Max Age',
			type: 'number',
			icon: HashIcon
		},
		filterFn: filterFn('number'),
		sortingFn: 'alphanumeric'
	}),
	columnHelper.accessor(row => row.maxBoys, {
		id: 'maxBoys',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Max Boys Count' />
		),
		cell: ({ row }) => <div>{row.getValue('maxBoys')}</div>,
		meta: {
			displayName: 'Max Boys Count',
			type: 'number',
			icon: HashIcon
		},
		filterFn: filterFn('number'),
		sortingFn: 'alphanumeric'
	}),
	columnHelper.accessor(row => row.maxGirls, {
		id: 'maxGirls',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Max Girls Count' />
		),
		cell: ({ row }) => <div>{row.getValue('maxGirls')}</div>,
		meta: {
			displayName: 'Max Girls Count',
			type: 'number',
			icon: HashIcon
		},
		filterFn: filterFn('number'),
		sortingFn: 'alphanumeric'
	}),
	columnHelper.accessor(row => row.totalEventsAllowed, {
		id: 'totalEventsAllowed',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Total Events Allowed' />
		),
		cell: ({ row }) => <div>{row.getValue('totalEventsAllowed')}</div>,
		meta: {
			displayName: 'Total Events Allowed',
			type: 'number',
			icon: HashIcon
		},
		filterFn: filterFn('number'),
		sortingFn: 'alphanumeric'
	}),
	columnHelper.accessor(row => row.maxEventsPerCategory, {
		id: 'maxEventsPerCategory',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Max Events Per Category' />
		),
		cell: ({ row }) => <div>{row.getValue('maxEventsPerCategory')}</div>,
		meta: {
			displayName: 'Max Events Per Category',
			type: 'number',
			icon: HashIcon
		},
		filterFn: filterFn('number'),
		sortingFn: 'alphanumeric'
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<ParticipantCategory> }) => {
			return <Actions participantCategory={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({
	participantCategory
}: {
	participantCategory: ParticipantCategory;
}) => {
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
							z.mutate.participantCategories.delete({
								id: participantCategory.id
							})
						]).catch(e => {
							console.log('Failed to delete center', e);
						});
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
			<ParticipantCategoryFormDialog
				participantCategory={participantCategory}
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</DropdownMenu>
	);
};
