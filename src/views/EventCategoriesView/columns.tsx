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
import useZero from '@/hooks/useZero';
import { defineMeta, filterFn } from '@/lib/filters';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { Ellipsis, Heading1Icon, ShieldUser } from 'lucide-react';
import { useState } from 'react';

import { EventCategory } from './EventCategoriesView';
import EventCategoryFormDialog from './EventCategoryFormDialog';

const columnHelper = createColumnHelper<EventCategory>();

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
	columnHelper.accessor(row => row.coordinator, {
		id: 'coordinator',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Coordinator' />
		),
		cell: ({ row }) => {
			const coordinator = row.getValue<
				EventCategory['coordinator'] | undefined
			>('coordinator');
			return coordinator ? (
				<Badge variant='outline'>
					{coordinator.firstName} {coordinator.lastName}
				</Badge>
			) : null;
		},
		filterFn: filterFn('option'),
		enableSorting: false,
		meta: defineMeta(row => row.coordinator, {
			displayName: 'Coordinator',
			type: 'option',
			icon: ShieldUser,
			transformOptionFn(data) {
				return {
					value: data.id,
					label: data.firstName + ' ' + data.lastName
				};
			}
		})
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<EventCategory> }) => {
			return <Actions eventCategory={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ eventCategory }: { eventCategory: EventCategory }) => {
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
							z.mutate.eventCategories.delete({
								id: eventCategory.id
							})
						]).catch(e => {
							console.log('Failed to delete event category', e);
						});
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
			<EventCategoryFormDialog
				eventCategory={eventCategory}
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</DropdownMenu>
	);
};
