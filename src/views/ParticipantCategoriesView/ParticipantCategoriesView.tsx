import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { useQuery } from '@rocicorp/zero/react';
import { ParticipantCategory } from 'shared/db/schema.zero';

import ParticipantCategoryFormDialog from './ParticipantCategoryFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

export default function ParticipantCategoriesView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [participantCategories, status] = useQuery(
		z.query.participantCategories.orderBy('createdAt', 'desc')
	);

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!participantCategories) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load participant categories</p>
				</p>
			</div>
		);
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
