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
import { toast } from 'sonner';

import EventFormDialog from './EventFormDialog';
import { Event, EventRow } from './EventsView';

const columnHelper = createColumnHelper<EventRow>();

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
	columnHelper.accessor(
		row => `${row.event.name} - ${row.subEvent.participantCategory?.name}`,
		{
			id: 'name',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title='Name' />
			),
			cell: ({ row }) => <div>{row.getValue('name')}</div>,
			sortingFn: 'alphanumeric',
			meta: {
				displayName: 'Name'
			}
		}
	),
	columnHelper.accessor(row => row.subEvent.startTime, {
		id: 'startTime',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Start Time' />
		),
		cell: ({ row }) => <div>{format(row.getValue('startTime'), 'p')}</div>,
		meta: {
			displayName: 'Start Time'
		}
	}),
	columnHelper.accessor(row => row.subEvent.endTime, {
		id: 'endTime',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='End Time' />
		),
		cell: ({ row }) => <div>{format(row.getValue('endTime'), 'p')}</div>,
		meta: {
			displayName: 'End Time'
		}
	}),
	columnHelper.accessor(row => row.event.category?.name, {
		id: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
		cell: ({ row }) => {
			const category = row.getValue<string | undefined>('category');
			return category ? <Badge variant='outline'>{category}</Badge> : null;
		},
		meta: {
			displayName: 'Category'
		}
	}),
	columnHelper.accessor(row => row.subEvent.participantCategory?.name, {
		id: 'participantCategory',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Participant Category' />
		),
		cell: ({ row }) => {
			const participantCategory = row.getValue<string | undefined>(
				'participantCategory'
			);
			return participantCategory ? (
				<Badge variant='outline'>{participantCategory}</Badge>
			) : null;
		},
		meta: {
			displayName: 'Participant Category'
		}
	}),
	columnHelper.accessor(row => row.event.allowedGender, {
		id: 'allowedGender',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Allowed Gender' />
		),
		cell: ({ row }) => (
			<Badge variant='outline' className='capitalize'>
				{row.getValue('allowedGender')}
			</Badge>
		),
		meta: {
			displayName: 'Allowed Gender'
		}
	}),
	columnHelper.accessor(
		row => row.event.coordinators.map(coordinator => coordinator.user),
		{
			id: 'coordinators',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title='Coordinators' />
			),
			cell: ({ row }) => {
				const coordinators =
					row.getValue<Event['coordinators'][number]['user'][]>('coordinators');

				if (coordinators?.length === 0) return null;

				return (
					<div className='flex gap-1'>
						{coordinators.map(coordinator => (
							<Badge variant='outline' key={coordinator?.id}>
								{coordinator?.firstName} {coordinator?.lastName ?? ''}
							</Badge>
						))}
					</div>
				);
			},
			enableSorting: false,
			meta: {
				displayName: 'Coordinators'
			}
		}
	),
	columnHelper.accessor(
		row => row.event.volunteers.map(volunteer => volunteer.user),
		{
			id: 'volunteers',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title='Volunteers' />
			),
			cell: ({ row }) => {
				const volunteers =
					row.getValue<Event['volunteers'][number]['user'][]>('volunteers');

				if (volunteers?.length === 0) return null;

				return (
					<div className='flex gap-1'>
						{volunteers.map(volunteer => (
							<Badge variant='outline' key={volunteer?.id}>
								{volunteer?.firstName} {volunteer?.lastName ?? ''}
							</Badge>
						))}
					</div>
				);
			},
			enableSorting: false,
			meta: {
				displayName: 'Volunteers'
			}
		}
	),
	columnHelper.accessor(row => row.subEvent.participants.length, {
		id: 'participants',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Participants' />
		),
		cell: ({ row }) => <div>{row.getValue('participants')}</div>,
		meta: {
			displayName: 'Participants'
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<EventRow> }) => {
			return <Actions eventRow={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ eventRow }: { eventRow: EventRow }) => {
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
						z.mutate.subEvents
							.delete({
								id: eventRow.subEvent.id
							})
							.server.catch((e: Error) => {
								toast.error('Error deleting event', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
			{isDialogOpen && (
				<EventFormDialog
					event={eventRow.event}
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				/>
			)}
		</DropdownMenu>
	);
};
