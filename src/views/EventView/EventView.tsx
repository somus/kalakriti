import DataTableWrapper from '@/components/data-table-wrapper';
import { Separator } from '@/components/ui/separator';
import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, useParams } from 'react-router';
import { z } from 'zod';

import { Participant } from '../ParticipantsView/ParticipantsView';
import { columns } from '../ParticipantsView/columns';
import { columnsConfig } from '../ParticipantsView/filters';

function eventQuery(z: Zero<Schema>, eventId: string) {
	return z.query.events
		.where('id', eventId)
		.related('participants', q =>
			q.related('participant', q =>
				q.related('participantCategory').related('center')
			)
		)
		.related('coordinator')
		.related('category')
		.one();
}

export type Event = NonNullable<Row<ReturnType<typeof eventQuery>>>;

export default function EventView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const params = useParams();
	const zero = useZero();
	const eventId = z.string().cuid2().parse(params.eventId);
	const [event, status] = useQuery(eventQuery(zero, eventId));

	if (!eventId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete' || !event) {
		return null;
	}

	return (
		<>
			<div className='px-4'>
				<h3 className='text-2xl font-semibold tracking-tight'>{event.name}</h3>
				<Separator className='my-4' />
			</div>
			<DataTableWrapper
				data={event.participants.map(p => p.participant) as Participant[]}
				columns={columns}
				columnsConfig={columnsConfig}
			/>
		</>
	);
}
