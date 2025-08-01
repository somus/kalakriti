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
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import {
	Calendar1Icon,
	CheckIcon,
	IdCardIcon,
	TrashIcon,
	XIcon
} from 'lucide-react';
import { useOutletContext } from 'react-router';
import { toast } from 'sonner';

import { SubEventParticipant } from './CenterEventView';

const columnHelper = createColumnHelper<
	SubEventParticipant & { subRows?: SubEventParticipant[] }
>();

export const columns = [
	columnHelper.accessor(row => row.participant?.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Name' />
		),
		cell: ({ row }) => (
			<div className={row.depth === 0 ? 'pl-4' : ''}>
				{row.getValue('name')}
			</div>
		),
		sortingFn: 'alphanumeric',
		meta: {
			displayName: 'Name'
		}
	}),
	columnHelper.accessor(row => row.participant?.age, {
		id: 'age',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Age' />
		),
		cell: ({ row }) => (
			<div className='flex gap-2 items-center'>
				{row.getValue('age')}
				{!!row.getValue('age') && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Calendar1Icon className='size-4' />
						</TooltipTrigger>
						<TooltipContent>
							(
							{row.original.participant?.dob &&
								formatDate(row.original.participant?.dob, 'dd LLL yyyy')}
							)
						</TooltipContent>
					</Tooltip>
				)}
			</div>
		),
		meta: {
			displayName: 'Age'
		}
	}),
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
	columnHelper.accessor(row => (row.attended ?? false).toString(), {
		id: 'attended',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Attended' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{(
					row.original.subRows
						? row.original.subRows.every(row => row.attended === true)
						: row.getValue('attended') === 'true'
				) ? (
					<CheckIcon className='size-5 text-green-500' />
				) : (
					<XIcon className='size-5 text-destructive' />
				)}
			</div>
		),
		meta: {
			displayName: 'Attended'
		}
	}),
	{
		id: 'view-id-card',
		cell: ({ row }: { row: Row<SubEventParticipant> }) => {
			if (!row.original.participant) return null;

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
								name={row.original.participant.name}
								role={row.original.participant.center?.name ?? 'Participant'}
								type='participant'
								qrCodeValue={JSON.stringify({
									type: 'participant',
									id: row.original.participant.id
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
					participantId={row.original.id}
					isSubGroupItem={row.depth > 0}
					groupId={row.original.groupId}
				/>
			);
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({
	participantId,
	isSubGroupItem,
	groupId
}: {
	participantId: string;
	isSubGroupItem: boolean;
	groupId?: string | null;
}) => {
	const context = useOutletContext<CenterOutletContext>();
	const z = useZero();
	const {
		user: { role, liaisoningCenters, guardianCenters }
	} = useApp();
	const canDelete = liaisoningCenters.length > 0 || guardianCenters.length > 0;

	if (isSubGroupItem || !canDelete) {
		return null;
	}

	return (
		<Button
			variant='ghost'
			aria-label='Delete participant from event'
			className='flex size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive *:[svg]:!text-destructive'
			disabled={
				(!!context?.center?.isLocked || !context?.center?.enableEventMapping) &&
				role !== 'admin'
			}
			onClick={() => {
				if (groupId) {
					z.mutate.subEventParticipants
						.deleteByGroupId({ groupId })
						.client.catch((e: Error) => {
							toast.error('Error deleting participant group from event', {
								description: e.message || 'Something went wrong'
							});
						});
				} else {
					z.mutate.subEventParticipants
						.delete({
							id: participantId
						})
						.client.catch((e: Error) => {
							toast.error('Error deleting participant from event', {
								description: e.message || 'Something went wrong'
							});
						});
				}
			}}
		>
			<TrashIcon />
		</Button>
	);
};
