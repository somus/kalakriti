import DataTableWrapper from '@/components/data-table-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, useParams } from 'react-router';
import { z } from 'zod';

import AddEventParticipantsDialog from './AddEventParticipantsDialog/AddEventParticipantsDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function subEventQuery(z: Zero<Schema>, eventId: string) {
	return z.query.subEvents
		.where('id', eventId)
		.related('participants', q => q.related('participant'))
		.related('participantCategory')
		.related('event', q => q.related('category').related('subEvents'))
		.one();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subEventParticipantQuery(z: Zero<Schema>) {
	return z.query.subEventParticipants.related('participant');
}

export type SubEvent = NonNullable<Row<ReturnType<typeof subEventQuery>>>;
export type SubEventParticipant = Row<
	ReturnType<typeof subEventParticipantQuery>
>;

export default function CenterEventsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const params = useParams();
	const zero = useZero();
	const eventId = z.string().cuid2().parse(params.eventId);
	const [subEvent, status] = useQuery(subEventQuery(zero, eventId));

	if (!eventId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete' || !subEvent) {
		return null;
	}

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex gap-2'>
				<h3>
					{subEvent.event?.name} - {subEvent.participantCategory?.name}
				</h3>
				<Badge variant='outline'>{subEvent.event?.category?.name}</Badge>
			</div>
			<DataTableWrapper
				data={subEvent.participants as SubEventParticipant[]}
				columns={columns}
				columnsConfig={columnsConfig}
				additionalActions={[
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
				]}
			/>
		</div>
	);
}
