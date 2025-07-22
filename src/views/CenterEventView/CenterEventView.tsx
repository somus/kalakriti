import DataTableWrapper from '@/components/data-table-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { H3 } from '@/components/ui/typography';
import { useApp } from '@/hooks/useApp';
import useZero, { Zero } from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { formatDate } from 'date-fns';
import groupBy from 'lodash/groupBy';
import { Navigate, useOutletContext, useParams } from 'react-router';
import * as z from 'zod';

import AddEventParticipantsDialog from './AddEventParticipantsDialog/AddEventParticipantsDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function subEventQuery(z: Zero, eventId: string) {
	return z.query.subEvents
		.where('id', eventId)
		.related('participants', q =>
			q
				.related('participant', q => q.related('center'))
				.orderBy('createdAt', 'desc')
		)
		.related('participantCategory')
		.related('event', q => q.related('category').related('subEvents'))
		.one();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subEventParticipantQuery(z: Zero) {
	return z.query.subEventParticipants.related('participant', q =>
		q.related('center')
	);
}

export type SubEvent = NonNullable<Row<ReturnType<typeof subEventQuery>>>;
export type SubEventParticipant = Row<
	ReturnType<typeof subEventParticipantQuery>
>;

export default function CenterEventView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const { center } = useOutletContext<CenterOutletContext>();
	const params = useParams();
	const zero = useZero();
	const {
		user: { role }
	} = useApp();
	const eventId = z.cuid2().parse(params.eventId);
	const [subEvent, status] = useQuery(subEventQuery(zero, eventId));

	if (!eventId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete' || !subEvent || !subEvent.event) {
		return null;
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
						name: `Group ${key + 1}`
					},
					subRows: group
				})
			)
		: subEvent.participants;

	return (
		<div className='flex flex-col py-4 flex-1'>
			<div className='flex px-4 justify-between items-center'>
				<div className='flex gap-4 items-end flex-wrap'>
					<H3>
						{subEvent.event.name} - {subEvent.participantCategory?.name}
					</H3>
					<p className='italic'>
						{formatDate(subEvent.startTime, 'p')} -{' '}
						{formatDate(subEvent.endTime, 'p')}
					</p>
					<div className='flex gap-1 flex-wrap'>
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
				columnsToHide={['center']}
				additionalActions={[
					((center?.isLocked || !center?.enableEventMapping) &&
						role !== 'admin') ||
					participants.length >= maxParticipants ? (
						<Tooltip key='create-participant'>
							<TooltipTrigger asChild>
								<span>
									<Button className='h-7' disabled>
										Add Participants
									</Button>
								</span>
							</TooltipTrigger>
							<TooltipContent>
								{participants.length >= maxParticipants ? (
									<p>Max participants reached.</p>
								) : (
									<p>Editing is locked. Please contact your liason.</p>
								)}
							</TooltipContent>
						</Tooltip>
					) : (
						<AddEventParticipantsDialog
							key='add-event-participants'
							subEvent={subEvent}
							eventCategoryId={subEvent.event?.eventCategoryId ?? ''}
							participantsToBeFiltered={subEvent.participants.map(
								participant => participant.participantId
							)}
						>
							<Button className='h-7'>Add Participants</Button>
						</AddEventParticipantsDialog>
					)
				]}
			/>
		</div>
	);
}
