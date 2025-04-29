import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useTable from '@/hooks/useTable';
import useZero from '@/hooks/useZero';
import ParticipantFormDialog from '@/views/ParticipantsView/ParticipantFormDialog';
import { columns } from '@/views/ParticipantsView/columns';
import { useQuery } from '@rocicorp/zero/react';

import { Participant } from '../ParticipantsView/ParticipantsView';

export default function CenterParticipantsView() {
	const zero = useZero();
	const [participants, status] = useQuery(
		zero.query.participants.related('center').related('participantCategory')
	);
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
