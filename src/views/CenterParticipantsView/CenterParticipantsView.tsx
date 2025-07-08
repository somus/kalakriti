import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import ParticipantFormDialog from '@/views/ParticipantsView/ParticipantFormDialog';
import { columns } from '@/views/ParticipantsView/columns';
import { columnsConfig } from '@/views/ParticipantsView/filters';
import { useQuery } from '@rocicorp/zero/react';
import { useOutletContext } from 'react-router';

import { Participant } from '../ParticipantsView/ParticipantsView';

export default function CenterParticipantsView() {
	const { center } = useOutletContext<CenterOutletContext>();
	const zero = useZero();
	const {
		user: { role }
	} = useApp();
	const [participants, status] = useQuery(
		zero.query.participants
			.where('centerId', '=', center.id)
			.related('center')
			.related('participantCategory')
			.orderBy('createdAt', 'desc')
	);

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			data={participants as Participant[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				center?.isLocked && role !== 'admin' ? (
					<Tooltip key='create-participant'>
						<TooltipTrigger asChild>
							<span>
								<Button className='h-7' disabled>
									Create Participant
								</Button>
							</span>
						</TooltipTrigger>
						<TooltipContent>
							<p>Editing is locked. Please contact your liason.</p>
						</TooltipContent>
					</Tooltip>
				) : (
					<ParticipantFormDialog key='create-participant'>
						<Button className='h-7'>Create Participant</Button>
					</ParticipantFormDialog>
				)
			]}
		/>
	);
}
