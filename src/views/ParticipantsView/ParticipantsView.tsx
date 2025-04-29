import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { Schema } from '@/db/schema.zero';
import useTable from '@/hooks/useTable';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import ParticipantFormDialog from './ParticipantFormDialog';
import { columns } from './columns';

function participantsQuery(z: Zero<Schema>) {
	return z.query.participants.related('center').related('participantCategory');
}

export type Participant = Row<ReturnType<typeof participantsQuery>>;

export default function ParticipantsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const zero = useZero();
	const [participants, status] = useQuery(participantsQuery(zero));
	const table = useTable<Participant>({
		data: participants as Participant[],
		columns
	});

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			table={table}
			additionalActions={[
				<ParticipantFormDialog key='create-participant'>
					<Button className='h-7'>Create Participant</Button>
				</ParticipantFormDialog>
			]}
		/>
	);
}
