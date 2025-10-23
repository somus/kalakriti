import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import { SubEvent } from '../CenterEventView/CenterEventView';
import EventFormDialog from './EventFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function eventsQuery(z: Zero) {
	return z.query.events
		.related('coordinators', q => q.related('user'))
		.related('volunteers', q => q.related('user'))
		.related('category')
		.related('subEvents', q =>
			q.related('participants').related('participantCategory')
		)
		.orderBy('createdAt', 'desc');
}

export type Event = Row<ReturnType<typeof eventsQuery>>;
export interface EventRow {
	id: string;
	event: Event;
	subEvent: SubEvent;
}

export default function EventsView() {
	'use no memo';

	const zero = useZero();
	const [events, status] = useQuery(eventsQuery(zero));

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!events) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load events</p>
				</p>
			</div>
		);
	}

	const eventRows = events.flatMap(event =>
		event.subEvents.map(subEvent => ({
			id: subEvent.id,
			event,
			subEvent
		}))
	);

	return (
		<DataTableWrapper
			data={eventRows as EventRow[]}
			columns={columns}
			columnsConfig={columnsConfig}
			columnsToHide={[
				'isGroupEvent',
				'maxParticipants',
				'minGroupSize',
				'maxGroupSize'
			]}
			getRowLink={row => `/events/${row.original.id}`}
			additionalActions={[
				<EventFormDialog key='create-event'>
					<Button className='h-7'>Create Event</Button>
				</EventFormDialog>
			]}
		/>
	);
}
