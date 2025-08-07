import DataTableWrapper from '@/components/data-table-wrapper';
import useZero, { Zero } from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { useLocation, useOutletContext } from 'react-router';

import { SubEvent } from '../CenterEventView/CenterEventView';
import { columns } from './columns';
import { columnsConfig } from './filters';

function centerEventsQuery(z: Zero, centerId: string) {
	return z.query.events
		.related('category')
		.related('subEvents', q =>
			q
				.related('participants', q =>
					q.whereExists('participant', q => q.where('centerId', centerId))
				)
				.related('participantCategory')
		)
		.orderBy('createdAt', 'desc');
}

export type CenterEvent = Row<ReturnType<typeof centerEventsQuery>>;
export interface CenterEventRow {
	id: string;
	event: CenterEvent;
	subEvent: SubEvent;
}

export default function CenterEventsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const { center } = useOutletContext<CenterOutletContext>();
	const zero = useZero();
	const [events, status] = useQuery(centerEventsQuery(zero, center.id));

	const { pathname } = useLocation();

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
			data={eventRows as CenterEventRow[]}
			columns={columns}
			columnsConfig={columnsConfig}
			getRowLink={row => `${pathname}/${row.original.id}`}
		/>
	);
}
