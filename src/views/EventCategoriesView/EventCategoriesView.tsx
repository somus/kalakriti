import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import EventCategoryFormDialog from './EventCategoryFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function eventCategoriesQuery(z: Zero) {
	return z.query.eventCategories
		.related('coordinator', q => q.related('coordinatingEventCategories'))
		.orderBy('createdAt', 'desc');
}

export type EventCategory = Row<ReturnType<typeof eventCategoriesQuery>>;

export default function EventCategoriesView() {
	'use no memo';
	const z = useZero();
	const [eventCategories, status] = useQuery(eventCategoriesQuery(z));

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!eventCategories) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load event categories</p>
				</p>
			</div>
		);
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
