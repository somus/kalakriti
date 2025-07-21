import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropDrawer,
	DropDrawerContent,
	DropDrawerItem,
	DropDrawerTrigger
} from '@/components/ui/dropdrawer';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Calendar1Icon, Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { toast } from 'sonner';

import ParticipantFormDialog from './ParticipantFormDialog';
import { Participant } from './ParticipantsView';

const columnHelper = createColumnHelper<Participant>();

export const columns = [
	columnHelper.accessor(row => row.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Name' />
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('name')}</div>,
		sortingFn: 'alphanumeric',
		meta: {
			displayName: 'Name'
		}
	}),
	columnHelper.accessor(row => row.age, {
		id: 'age',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Age' />
		),
		cell: ({ row }) => (
			<div className='flex gap-2 items-center'>
				{row.getValue('age')}
				<Tooltip>
					<TooltipTrigger asChild>
						<Calendar1Icon className='size-4' />
					</TooltipTrigger>
					<TooltipContent>
						({formatDate(row.original.dob, 'dd LLL yyyy')})
					</TooltipContent>
				</Tooltip>
			</div>
		),
		meta: {
			displayName: 'Age'
		}
	}),
	columnHelper.accessor(row => row.gender, {
		id: 'gender',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Gender' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>{row.getValue('gender')}</div>
		),
		meta: {
			displayName: 'Gender'
		}
	}),
	columnHelper.accessor(row => row.participantCategory, {
		id: 'participantCategory',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Participant Category' />
		),
		cell: ({ row }) => {
			const participantCategory = row.getValue<
				Participant['participantCategory'] | undefined
			>('participantCategory');
			return participantCategory ? (
				<Badge variant='outline'>{participantCategory.name}</Badge>
			) : null;
		},
		enableSorting: false,
		meta: {
			displayName: 'Participant Category'
		}
	}),
	columnHelper.accessor(row => row.center, {
		id: 'center',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Center' />
		),
		cell: ({ row }) => {
			const center = row.getValue<Participant['center'] | undefined>('center');
			return center ? <Badge variant='outline'>{center.name}</Badge> : null;
		},
		enableSorting: false,
		meta: {
			displayName: 'Center'
		}
	}),
	columnHelper.accessor(
		row => row.subEvents.map(subEvent => subEvent.subEvent),
		{
			id: 'events',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title='Events' />
			),
			cell: ({ row }) => {
				const subEvents = row.getValue<
					Participant['subEvents'][number]['subEvent'][] | undefined
				>('events');
				return subEvents ? (
					<div className='flex gap-1'>
						{subEvents
							.sort((a, b) =>
								(a?.event?.name ?? '').localeCompare(b?.event?.name ?? '')
							)
							.map(subEvent => (
								<Badge variant='outline' key={subEvent?.id}>
									{subEvent?.event?.name} -{' '}
									{subEvent?.participantCategory?.name}
								</Badge>
							))}
					</div>
				) : null;
			},
			enableSorting: false,
			meta: {
				displayName: 'Events'
			}
		}
	),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<Participant> }) => {
			return <Actions participant={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ participant }: { participant: Participant }) => {
	const context = useOutletContext<CenterOutletContext>();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const z = useZero();

	return (
		<DropDrawer modal={false}>
			<DropDrawerTrigger asChild>
				<Button
					aria-label='Open menu'
					variant='ghost'
					className='flex size-8 p-0 data-[state=open]:bg-muted'
				>
					<Ellipsis className='size-4' aria-hidden='true' />
				</Button>
			</DropDrawerTrigger>
			<DropDrawerContent align='end'>
				<DropDrawerItem
					onSelect={() => setIsDialogOpen(true)}
					disabled={context?.center.isLocked ?? false}
				>
					Edit
				</DropDrawerItem>
				<DropDrawerItem
					variant='destructive'
					disabled={context?.center.isLocked ?? false}
					onSelect={() => {
						z.mutate.participants
							.delete({
								id: participant.id
							})
							.server.catch((e: Error) => {
								toast.error('Error deleting participant', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					Delete
				</DropDrawerItem>
			</DropDrawerContent>
			{isDialogOpen && (
				<ParticipantFormDialog
					participant={participant}
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				/>
			)}
		</DropDrawer>
	);
};
