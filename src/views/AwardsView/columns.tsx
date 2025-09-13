import { IdCard } from '@/components/IdCard';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	DropDrawer,
	DropDrawerContent,
	DropDrawerItem,
	DropDrawerTrigger
} from '@/components/ui/dropdrawer';
import useZero from '@/hooks/useZero';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { CheckIcon, Ellipsis, IdCardIcon } from 'lucide-react';
import { toast } from 'sonner';

import { SubEventParticipant } from './AwardsView';

const columnHelper = createColumnHelper<SubEventParticipant>();

export const columns = [
	columnHelper.accessor(row => row.participant?.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Name' />
		),
		cell: ({ row }) => (
			<div
				className={`${row.depth === 0 ? 'pl-4' : ''} ${row.original.subRows ? 'font-medium' : ''}`}
			>
				{row.subRows?.length > 0 && <Badge variant='outline'>Group</Badge>}{' '}
				{row.getValue('name')}
			</div>
		),
		sortingFn: 'alphanumeric',
		meta: {
			displayName: 'Name'
		}
	}),
	columnHelper.accessor(
		row =>
			((row.subRows && row.subRows?.length > 0) ?? row.groupId !== null)
				? 'group'
				: 'individual',
		{
			id: 'type',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title='Type' />
			),
			cell: ({ row }) => (
				<Badge variant='outline' className='capitalize'>
					{row.getValue('type')}
				</Badge>
			),
			meta: {
				displayName: 'Type'
			}
		}
	),
	columnHelper.accessor(row => row.participant?.gender, {
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
	columnHelper.accessor(row => row.subEvent?.event?.name, {
		id: 'event',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Event' />
		),
		cell: ({ row }) => {
			const event = row.getValue<string | undefined>('event');
			return event ? (
				<Badge variant='outline'>
					{event} - {row.original.subEvent?.participantCategory?.name}
				</Badge>
			) : null;
		},
		meta: {
			displayName: 'Event'
		}
	}),
	columnHelper.accessor(row => row.subEvent?.participantCategory?.name, {
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
	columnHelper.accessor(row => row.participant?.center?.name, {
		id: 'center',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Center' />
		),
		cell: ({ row }) => {
			const center = row.getValue<string | undefined>('center');
			return center ? <Badge variant='outline'>{center}</Badge> : null;
		},
		meta: {
			displayName: 'Center'
		}
	}),
	columnHelper.accessor(row => (row.isWinner ? 'Winner' : 'Runner up'), {
		id: 'award',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Winner / Runner up' />
		),
		cell: ({ row }) => (
			<Badge variant='outline'>
				{(
					row.original.subRows
						? row.original.subRows.some(row => row.isWinner === true)
						: row.getValue('award') === 'Winner'
				)
					? 'Winner'
					: 'Runner up'}
			</Badge>
		),
		meta: {
			displayName: 'Winner'
		}
	}),
	columnHelper.accessor(row => (row.prizeAwarded ?? false).toString(), {
		id: 'prizeAwarded',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Prize Awarded' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{(
					row.original.subRows
						? row.original.subRows.some(row => row.prizeAwarded === true)
						: row.getValue('prizeAwarded') === 'true'
				) ? (
					<CheckIcon className='size-5 text-green-500' />
				) : null}
			</div>
		),
		meta: {
			displayName: 'Prize Awarded'
		}
	}),
	{
		id: 'view-id-card',
		cell: ({ row }: { row: Row<SubEventParticipant> }) => {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<Button variant='ghost' size='icon' className='size-6'>
							<IdCardIcon className='size-4' aria-hidden='true' />
						</Button>
					</DialogTrigger>
					<DialogContent
						className='border-0 bg-transparent p-0 shadow-none'
						aria-describedby={undefined}
					>
						<DialogTitle className='hidden'>ID Card</DialogTitle>
						<div
							style={{
								height: 'auto',
								margin: '0 auto',
								maxWidth: 256,
								width: '100%'
							}}
						>
							<IdCard
								name={row.original.participant?.name ?? 'No Name'}
								role={`${row.original.participant?.center?.name ?? 'Participant'} - ${row.original.subEvent?.participantCategory?.name ?? 'No Category'}`}
								type='participant'
								qrCodeValue={JSON.stringify({
									type: 'participant',
									id: row.original.participant?.id ?? 'No ID'
								})}
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
		cell: ({ row }: { row: Row<SubEventParticipant> }) => {
			return (
				<Actions
					participant={row.original}
					isGroupHeader={Array.isArray(row.original.subRows)}
				/>
			);
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({
	participant: { id, groupId, prizeAwarded, subRows },
	isGroupHeader
}: {
	participant: SubEventParticipant;
	isGroupHeader?: boolean;
}) => {
	const z = useZero();
	const isMarkedAsPrizeAwarded =
		prizeAwarded === true || !!subRows?.some(row => row.prizeAwarded === true);

	return (
		<DropDrawer modal={false}>
			<DropDrawerTrigger asChild>
				<Button
					aria-label='Open menu'
					variant='ghost'
					className='flex size-6 p-0 data-[state=open]:bg-muted'
				>
					<Ellipsis className='size-4' aria-hidden='true' />
				</Button>
			</DropDrawerTrigger>
			<DropDrawerContent align='end'>
				<DropDrawerItem
					onSelect={() => {
						z.mutate.subEventParticipants
							.togglePrizeAwarded({
								id,
								groupId: isGroupHeader ? (groupId ?? undefined) : undefined
							})
							.client.catch((e: Error) => {
								toast.error('Error toggling prize awarded for participant', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					{isMarkedAsPrizeAwarded ? 'Unaward' : 'Award'} prize
				</DropDrawerItem>
			</DropDrawerContent>
		</DropDrawer>
	);
};
