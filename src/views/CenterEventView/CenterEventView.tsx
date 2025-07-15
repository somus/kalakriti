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
import { Navigate, useOutletContext, useParams } from 'react-router';
import * as z from 'zod';

import AddEventParticipantsDialog from './AddEventParticipantsDialog/AddEventParticipantsDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function subEventQuery(z: Zero, eventId: string) {
	return z.query.subEvents
		.where('id', eventId)
		.related('participants', q => q.related('participant'))
		.related('participantCategory')
		.related('event', q => q.related('category').related('subEvents'))
		.one();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subEventParticipantQuery(z: Zero) {
	return z.query.subEventParticipants.related('participant');
}

export type SubEvent = NonNullable<Row<ReturnType<typeof subEventQuery>>>;
export type SubEventParticipant = Row<
	ReturnType<typeof subEventParticipantQuery>
>;

export default function CenterEventsView() {
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

	if (status.type !== 'complete' || !subEvent) {
		return null;
	}

	return (
		<div className='flex flex-col py-4'>
			<div className='flex gap-4 items-end px-4'>
				<H3>
					{subEvent.event?.name} - {subEvent.participantCategory?.name}
				</H3>
				<p className='italic'>
					{formatDate(subEvent.startTime, 'p')} -{' '}
					{formatDate(subEvent.endTime, 'p')}
				</p>
				<Badge variant='outline'>{subEvent.event?.category?.name}</Badge>
			</div>
			<DataTableWrapper
				data={subEvent.participants as SubEventParticipant[]}
				columns={columns}
				columnsConfig={columnsConfig}
				additionalActions={[
					center?.isLocked && role !== 'admin' ? (
						<Tooltip key='create-participant'>
							<TooltipTrigger asChild>
								<span>
									<Button className='h-7' disabled>
										Add Participants
									</Button>
								</span>
							</TooltipTrigger>
							<TooltipContent>
								<p>Editing is locked. Please contact your liason.</p>
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
