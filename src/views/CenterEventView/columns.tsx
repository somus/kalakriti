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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { env } from '@/env.client';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { useAuth } from '@clerk/clerk-react';
import { ColumnDef, Row, createColumnHelper } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import {
	Calendar1Icon,
	CheckIcon,
	Ellipsis,
	IdCardIcon,
	XIcon
} from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { toast } from 'sonner';

import { SubEventParticipant } from './CenterEventView';
import SubmissionPhotoFormDialog from './SubmissionPhotoFormDialog';

const columnHelper = createColumnHelper<
	SubEventParticipant & { subRows?: SubEventParticipant[] }
>();

export const columns = (isScoresheetUpdated: boolean) =>
	[
		columnHelper.accessor(row => row.participant?.name, {
			id: 'name',
			header: ({ column }) => (
				<DataTableColumnHeader className='ml-2' column={column} title='Name' />
			),
			cell: ({ row }) => (
				<div
					className={`${row.depth === 0 ? 'pl-4' : ''} ${row.original.subRows ? 'font-medium' : ''}`}
				>
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
				return center && !row.original.subRows ? (
					<Badge variant='outline'>{center}</Badge>
				) : null;
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
					{row.original.subRows ? null : row.getValue('attended') === 'true' ? (
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
		columnHelper.accessor(row => row.submissionPhoto, {
			id: 'submissionPhoto',
			header: ({ column }) => (
				<DataTableColumnHeader
					className='ml-2'
					column={column}
					title='Submission Photo'
				/>
			),
			cell: ({ row }) => (
				<div className='pl-4'>
					{row.getValue<string>('submissionPhoto') && (
						<Dialog>
							<DialogTrigger asChild>
								<img
									src={`${import.meta.env.DEV ? 'https://kalakriti.proudindian.ngo' : ''}/cdn-cgi/image/height=80,quality=75/${env.VITE_IMAGE_CDN}/${row.getValue<string>('submissionPhoto')}`}
									className='h-7 object-contain cursor-pointer'
								/>
							</DialogTrigger>
							<DialogTitle className='hidden'>
								{row.getValue('name')}
							</DialogTitle>
							<DialogContent
								className='max-w-7xl! border-0 bg-transparent p-0 shadow-none'
								aria-describedby={undefined}
							>
								<div className='relative h-[calc(100vh-220px)] w-full overflow-clip rounded-md bg-transparent'>
									<img
										src={`${import.meta.env.DEV ? 'https://kalakriti.proudindian.ngo' : ''}/cdn-cgi/image/height=800,quality=75/${env.VITE_IMAGE_CDN}/${row.getValue<string>('submissionPhoto')}`}
										className='h-full w-full object-contain'
									/>
								</div>
							</DialogContent>
						</Dialog>
					)}
				</div>
			)
		}),
		columnHelper.accessor(row => (row.isWinner ?? false).toString(), {
			id: 'isWinner',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title='Winner' />
			),
			cell: ({ row }) => (
				<div className='capitalize'>
					{row.original.subRows ||
					row.getValue('isWinner') === 'false' ? null : (
						<CheckIcon className='size-5 text-green-500' />
					)}
				</div>
			),
			meta: {
				displayName: 'Winner'
			}
		}),
		columnHelper.accessor(row => (row.isRunner ?? false).toString(), {
			id: 'isRunner',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title='Runner up' />
			),
			cell: ({ row }) => (
				<div className='capitalize'>
					{row.original.subRows ||
					row.getValue('isRunner') === 'false' ? null : (
						<CheckIcon className='size-5 text-green-500' />
					)}
				</div>
			),
			meta: {
				displayName: 'Runner up'
			}
		}),
		{
			id: 'view-id-card',
			cell: ({ row }: { row: Row<SubEventParticipant> }) => {
				if ('subRows' in row.original || !row.original.participant) return null;

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
						participant={row.original}
						isSubGroupItem={row.depth > 0}
						isScoresheetUpdated={isScoresheetUpdated}
					/>
				);
			},
			size: 32
		}
	] as ColumnDef<SubEventParticipant>[];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({
	participant,
	isSubGroupItem,
	isScoresheetUpdated
}: {
	participant: SubEventParticipant & { subRows?: SubEventParticipant[] };
	isSubGroupItem: boolean;
	isScoresheetUpdated: boolean;
}) => {
	const {
		id,
		groupId,
		attended,
		isWinner,
		isRunner,
		subRows,
		submissionPhoto
	} = participant;
	const context = useOutletContext<CenterOutletContext>();
	const z = useZero();
	const {
		user: {
			role,
			leading,
			liaisoningCenters,
			guardianCenters,
			coordinatingEvents
		}
	} = useApp();
	const { getToken } = useAuth();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const canDelete =
		liaisoningCenters.length > 0 ||
		guardianCenters.length > 0 ||
		role === 'admin' ||
		leading === 'cultural' ||
		leading === 'arts';
	const canMarkAttendance =
		coordinatingEvents.length > 0 ||
		role === 'admin' ||
		leading === 'cultural' ||
		leading === 'arts';
	const canMarkWinners =
		coordinatingEvents.length > 0 ||
		role === 'admin' ||
		leading === 'cultural' ||
		leading === 'arts';
	const canUpdateSubmissionPhoto =
		coordinatingEvents.length > 0 ||
		role === 'admin' ||
		leading === 'cultural' ||
		leading === 'arts';

	if (!canDelete && !canMarkAttendance && !canMarkWinners) {
		return null;
	}

	const isMarkedAttended =
		attended === true || !!subRows?.some(row => row.attended === true);
	const isMarkedAsWinner =
		isWinner === true || !!subRows?.some(row => row.isWinner === true);
	const isMarkedAsRunner =
		isRunner === true || !!subRows?.some(row => row.isRunner === true);

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
				{canMarkAttendance && (
					<DropDrawerItem
						disabled={isMarkedAsWinner || isMarkedAsRunner}
						onSelect={() => {
							z.mutate.subEventParticipants
								.toggleAttendance({
									id,
									groupId: !isSubGroupItem ? (groupId ?? undefined) : undefined
								})
								.client.catch((e: Error) => {
									toast.error(
										'Error toggling attendance for event participant',
										{
											description: e.message || 'Something went wrong'
										}
									);
								});
						}}
					>
						{isMarkedAttended ? 'Unmark' : 'Mark'} attendance
					</DropDrawerItem>
				)}
				{canMarkWinners && !isSubGroupItem && (
					<>
						<DropDrawerItem
							disabled={
								!isMarkedAttended || isMarkedAsRunner || !isScoresheetUpdated
							}
							onSelect={() => {
								z.mutate.subEventParticipants
									.toggleWinner({
										id,
										groupId: groupId ?? undefined
									})
									.client.catch((e: Error) => {
										toast.error('Error toggling event participant as winner', {
											description: e.message || 'Something went wrong'
										});
									});
							}}
						>
							{isMarkedAsWinner ? 'Unmark' : 'Mark'} as winner
						</DropDrawerItem>
						<DropDrawerItem
							disabled={
								!isMarkedAttended || isMarkedAsWinner || !isScoresheetUpdated
							}
							onSelect={() => {
								z.mutate.subEventParticipants
									.toggleRunnerUp({
										id,
										groupId: groupId ?? undefined
									})
									.client.catch((e: Error) => {
										toast.error(
											'Error toggling event participant as runner up',
											{
												description: e.message || 'Something went wrong'
											}
										);
									});
							}}
						>
							{isMarkedAsRunner ? 'Unmark' : 'Mark'} as runner up
						</DropDrawerItem>
					</>
				)}
				{canUpdateSubmissionPhoto && (!subRows || isSubGroupItem) && (
					<DropDrawerItem onSelect={() => setIsDialogOpen(true)}>
						{!submissionPhoto
							? 'Add submission photo'
							: 'Update submission photo'}
					</DropDrawerItem>
				)}
				{canUpdateSubmissionPhoto &&
					(!subRows || isSubGroupItem) &&
					!!submissionPhoto && (
						<DropDrawerItem
							variant='destructive'
							onSelect={() => {
								z.mutate.subEventParticipants
									.updateSubmissionPhoto({
										id: participant.id,
										submissionPhoto: null
									})
									.client.then(async () => {
										// Delete photo from R2 bucket
										const token = await getToken();
										await fetch(`${env.VITE_API_SERVER}/deleteAsset`, {
											method: 'DELETE',
											headers: {
												accept: 'application/json',
												Authorization: `Bearer ${token}`
											},
											body: JSON.stringify({
												filePath: submissionPhoto
											})
										});
									})
									.catch((e: Error) => {
										toast.error('Error deleting submission photo', {
											description: e.message || 'Something went wrong'
										});
									});
							}}
						>
							Delete submission photo
						</DropDrawerItem>
					)}
				{canDelete && (
					<DropDrawerItem
						variant='destructive'
						aria-label='Delete participant from event'
						disabled={
							(!!context?.center?.isLocked ||
								!context?.center?.enableEventMapping) &&
							role !== 'admin'
						}
						onSelect={() => {
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
										id
									})
									.client.catch((e: Error) => {
										toast.error('Error deleting participant from event', {
											description: e.message || 'Something went wrong'
										});
									});
							}
						}}
					>
						Delete
					</DropDrawerItem>
				)}
			</DropDrawerContent>
			{isDialogOpen && (
				<SubmissionPhotoFormDialog
					participant={participant}
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				/>
			)}
		</DropDrawer>
	);
};
