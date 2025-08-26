import DataTableWrapper from '@/components/data-table-wrapper';
import { QrScanDialog } from '@/components/qr-scan-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { H3 } from '@/components/ui/typography';
import { useApp } from '@/hooks/useApp';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { formatDate } from 'date-fns';
import groupBy from 'lodash/groupBy';
import { ScanQrCodeIcon } from 'lucide-react';
import { Navigate, useParams } from 'react-router';
import { toast } from 'sonner';
import * as z from 'zod';

import { SubEventParticipant } from '../CenterEventView/CenterEventView';
import { columns } from '../CenterEventView/columns';
import { columnsConfig } from '../CenterEventView/filters';

function eventQuery(z: Zero, eventId: string) {
	return z.query.subEvents
		.where('id', eventId)
		.related('participants', q =>
			q.related('participant', q => q.related('center'))
		)
		.related('participantCategory')
		.related('event', q => q.related('coordinators').related('category'))
		.one();
}

export type Event = NonNullable<Row<ReturnType<typeof eventQuery>>>;

export default function EventView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const params = useParams();
	const zero = useZero();
	const {
		user: { role, coordinatingEvents }
	} = useApp();
	const eventId = z.cuid2().parse(params.eventId);
	const [subEvent, status] = useQuery(eventQuery(zero, eventId));

	if (!eventId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!subEvent?.event) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load event details</p>
				</p>
			</div>
		);
	}

	const {
		isGroupEvent,
		maxParticipants,
		minGroupSize,
		maxGroupSize,
		category
	} = subEvent.event;
	const participants = isGroupEvent
		? Object.values(groupBy(subEvent.participants, 'groupId')).map(
				(group, key) => ({
					groupId: group[0].groupId,
					participant: {
						name: `Group ${key + 1}`,
						center: {
							id: group[0].participant?.center?.id,
							name: group[0].participant?.center?.name
						}
					},
					subRows: group
				})
			)
		: subEvent.participants;

	return (
		<div className='flex flex-col pt-4 sm:py-4 flex-1'>
			<div className='flex px-4 justify-between items-center'>
				<div className='flex gap-2 sm:gap-4 items-end flex-wrap'>
					<H3 className='text-xl sm:text-2xl'>
						{subEvent.event.name} - {subEvent.participantCategory?.name}
					</H3>
					<p className='italic text-sm sm:text-base'>
						{formatDate(subEvent.startTime, 'p')} -{' '}
						{formatDate(subEvent.endTime, 'p')}
					</p>
					<div className='gap-1 flex-wrap hidden sm:flex'>
						<Badge variant='outline'>{category?.name}</Badge>
						{isGroupEvent && <Badge variant='outline'>Group Event</Badge>}
						{isGroupEvent ? (
							<>
								<Badge variant='outline'>
									Group Size:{' '}
									{minGroupSize === maxGroupSize
										? `${minGroupSize}`
										: `${minGroupSize} - ${maxGroupSize}`}
								</Badge>
								<Badge variant='outline'>Max Groups: {maxParticipants}</Badge>
							</>
						) : (
							<Badge variant='outline'>
								Max Participants: {maxParticipants}
							</Badge>
						)}
					</div>
				</div>
			</div>
			<DataTableWrapper
				data={participants as SubEventParticipant[]}
				columns={columns}
				columnsConfig={columnsConfig}
				additionalActions={[
					(coordinatingEvents.length > 0 || role === 'admin') && (
						<DropdownMenu key='scan-attendance'>
							<DropdownMenuTrigger asChild>
								<Button className='h-7'>
									<ScanQrCodeIcon />
									Scan
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
								// side={isMobile ? 'bottom' : 'right'}
								align='end'
								sideOffset={4}
							>
								<QrScanDialog
									title='Mark Participant Attendance'
									onScan={async scanResult => {
										if (scanResult.type !== 'participant') {
											throw new Error('Not a participant');
										}

										const subEventParticipant =
											await zero.query.subEventParticipants
												.where('participantId', scanResult.id)
												.whereExists('subEvent', q =>
													q.where('id', subEvent.id)
												)
												.one();

										if (!subEventParticipant) {
											throw new Error('Participant not found');
										}

										zero.mutate.subEventParticipants
											.toggleAttendance({
												id: subEventParticipant.id
											})
											.client.then(() => {
												toast.success(
													`Attendance ${subEventParticipant.attended ? 'unmarked' : 'marked'} successfully`
												);
											})
											.catch((e: Error) => {
												toast.error(
													'Error toggling attendance for event participant',
													{
														description: e.message || 'Something went wrong'
													}
												);
											});
									}}
								>
									<DropdownMenuItem onSelect={e => e.preventDefault()}>
										Toggle Attendance
									</DropdownMenuItem>
								</QrScanDialog>
							</DropdownMenuContent>
						</DropdownMenu>
					)
				]}
			/>
		</div>
	);
}
