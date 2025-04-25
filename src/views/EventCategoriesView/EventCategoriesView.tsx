import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { EventCategory } from '@/db/schema.zero';
import useTable from '@/hooks/useTable';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';

import EventCategoryFormDialog from './EventCategoryFormDialog';
import { columns } from './columns';

export default function EventCategoriesView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [eventCategories, status] = useQuery(
		z.query.eventCategories.related('coordinator', q =>
			q.related('coordinatingEventCategories')
		)
	);
	const table = useTable<EventCategory>({
		data: eventCategories as EventCategory[],
		columns
	});

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			table={table}
			additionalActions={[
				<EventCategoryFormDialog key='create-event-category'>
					<Button className='h-7'>Create Event Category</Button>
				</EventCategoryFormDialog>
			]}
		/>
	);
}
