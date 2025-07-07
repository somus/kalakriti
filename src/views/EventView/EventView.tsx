import DataTableWrapper from '@/components/data-table-wrapper';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import useZero, { Zero } from '@/hooks/useZero';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, useParams } from 'react-router';
import * as z from 'zod/v4';

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
	const eventId = z.cuid2().parse(params.eventId);
	const [subEvent, status] = useQuery(eventQuery(zero, eventId));

	if (!eventId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete' || !subEvent) {
		return null;
	}

	return (
		<div className='flex flex-col py-4'>
			<div className='px-4'>
				<div className='flex gap-2'>
					<h3 className='text-2xl font-semibold tracking-tight'>
						{subEvent.event?.name} - {subEvent.participantCategory?.name}
					</h3>
					<Badge variant='outline'>{subEvent.event?.category?.name}</Badge>
				</div>
				<Separator className='my-4' />
			</div>
			<DataTableWrapper
				data={subEvent.participants as SubEventParticipant[]}
				columns={columns}
				columnsConfig={columnsConfig}
			/>
		</div>
	);
}
