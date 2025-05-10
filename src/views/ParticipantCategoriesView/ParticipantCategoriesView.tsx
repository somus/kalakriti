import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { ParticipantCategory } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';

import ParticipantCategoryFormDialog from './ParticipantCategoryFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

export default function ParticipantCategoriesView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [participantCategories, status] = useQuery(
		z.query.participantCategories
	);

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			data={participantCategories as ParticipantCategory[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				<ParticipantCategoryFormDialog key='create-participant-category'>
					<Button className='h-7'>Create Participant Category</Button>
				</ParticipantCategoryFormDialog>
			]}
		/>
	);
}
