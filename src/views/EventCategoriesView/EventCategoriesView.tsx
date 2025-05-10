import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import EventCategoryFormDialog from './EventCategoryFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function eventCategoriesQuery(z: Zero<Schema>) {
	return z.query.eventCategories.related('coordinator', q =>
		q.related('coordinatingEventCategories')
	);
}

export type EventCategory = Row<ReturnType<typeof eventCategoriesQuery>>;

export default function EventCategoriesView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [eventCategories, status] = useQuery(eventCategoriesQuery(z));

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			data={eventCategories as EventCategory[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				<EventCategoryFormDialog key='create-event-category'>
					<Button className='h-7'>Create Event Category</Button>
				</EventCategoryFormDialog>
			]}
		/>
	);
}
