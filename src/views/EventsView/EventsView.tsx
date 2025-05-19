import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import EventFormDialog from './EventFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function eventsQuery(z: Zero<Schema>) {
	return z.query.events
		.related('coordinator')
		.related('category')
		.related('participants');
}

export type Event = Row<ReturnType<typeof eventsQuery>>;

export default function EventsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const zero = useZero();
	const [events, status] = useQuery(eventsQuery(zero));

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			data={events as Event[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				<EventFormDialog key='create-event'>
					<Button className='h-7'>Create Event</Button>
				</EventFormDialog>
			]}
		/>
	);
}
