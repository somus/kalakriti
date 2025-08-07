import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import ParticipantFormDialog from './ParticipantFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function participantsQuery(z: Zero) {
	return z.query.participants
		.related('center')
		.related('participantCategory')
		.related('subEvents', q =>
			q.related('subEvent', q =>
				q.related('event').related('participantCategory')
			)
		)
		.orderBy('createdAt', 'desc');
}

export type Participant = Row<ReturnType<typeof participantsQuery>>;

export default function ParticipantsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const zero = useZero();
	const [participants, status] = useQuery(participantsQuery(zero));

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!participants) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load participants</p>
				</p>
			</div>
		);
	}

	return (
		<DataTableWrapper
			data={participants as Participant[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				<ParticipantFormDialog key='create-participant'>
					<Button className='h-7'>Create Participant</Button>
				</ParticipantFormDialog>
			]}
		/>
	);
}
