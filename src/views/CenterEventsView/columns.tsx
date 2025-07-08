import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { LinkIcon } from 'lucide-react';
import { Link } from 'react-router';

import { CenterEventRow } from './CenterEventsView';

const columnHelper = createColumnHelper<CenterEventRow>();

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
				<Link to={row.original.id}>
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
	columnHelper.accessor(row => row.subEvent.participants.length, {
		id: 'participants',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Participants' />
		),
		cell: ({ row }) => <div>{row.getValue<number>('participants')}</div>,
		meta: {
			displayName: 'Participants'
		}
	})
];
