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
import { Row, createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Ellipsis, LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import EventFormDialog from './EventFormDialog';
import { Event } from './EventsView';

const columnHelper = createColumnHelper<Event>();

export const columns = [
	columnHelper.display({
		id: 'select',
		header: () => null,
		cell: ({ row }) => (
			<Button
				aria-label='View event'
				variant='ghost'
				className='flex size-8 p-0 data-[state=open]:bg-muted'
				asChild
			>
				<Link to={`/events/${row.original.id}`}>
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
		cell: ({ row }) => <div>{row.getValue('name')}</div>,
		sortingFn: 'alphanumeric',
		meta: {
			displayName: 'Name'
		}
	}),
	columnHelper.accessor(row => row.startTime, {
		id: 'startTime',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Start Time' />
		),
		cell: ({ row }) => <div>{format(row.getValue('startTime'), 'p')}</div>,
		meta: {
			displayName: 'Start Time'
		}
	}),
	columnHelper.accessor(row => row.endTime, {
		id: 'endTime',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='End Time' />
		),
		cell: ({ row }) => <div>{format(row.getValue('endTime'), 'p')}</div>,
		meta: {
			displayName: 'End Time'
		}
	}),
	columnHelper.accessor(row => row.category, {
		id: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
		cell: ({ row }) => {
			const category = row.getValue<Event['category'] | undefined>('category');
			return category ? <Badge variant='outline'>{category.name}</Badge> : null;
		},
		enableSorting: false,
		meta: {
			displayName: 'Category'
		}
	}),
	columnHelper.accessor(row => row.coordinator, {
		id: 'coordinator',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Coordinator' />
		),
		cell: ({ row }) => {
			const coordinator = row.getValue<Event['coordinator'] | undefined>(
				'coordinator'
			);
			return coordinator ? (
				<Badge variant='outline'>
					{coordinator.firstName} {coordinator.lastName}
				</Badge>
			) : null;
		},
		enableSorting: false,
		meta: {
			displayName: 'Coordinator'
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<Event> }) => {
			return <Actions event={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ event }: { event: Event }) => {
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
							z.mutate.events.delete({
								id: event.id
							})
						]).catch(e => {
							console.log('Failed to delete event', e);
						});
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
			<EventFormDialog
				event={event}
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</DropdownMenu>
	);
};
