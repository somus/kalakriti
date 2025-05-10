import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import ParticipantFormDialog from './ParticipantFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function participantsQuery(z: Zero<Schema>) {
	return z.query.participants.related('center').related('participantCategory');
}

export type Participant = Row<ReturnType<typeof participantsQuery>>;

export default function ParticipantsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const zero = useZero();
	const [participants, status] = useQuery(participantsQuery(zero));

	if (status.type !== 'complete') {
		return null;
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
