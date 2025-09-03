import { IdCardData, IdCardPdf } from '@/components/IdCardPdf';
import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { DownloadCloudIcon } from 'lucide-react';
import { useState } from 'react';

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
	const [prepareDownload, setPrepareDownload] = useState(false);

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

	const idData = participants.map(participant => ({
		name: participant.name,
		role: `${participant.center?.name ?? 'Participant'} - ${participant.participantCategory?.name ?? 'No Category'}`,
		qrCodeValue: JSON.stringify({
			type: 'participant',
			id: participant.id
		}),
		type: 'participant'
	})) as IdCardData[];

	return (
		<DataTableWrapper
			data={participants as Participant[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				<Button
					className='h-7'
					key='download-ids'
					variant='outline'
					onClick={() => {
						if (!prepareDownload) {
							setPrepareDownload(true);
						}
					}}
				>
					<DownloadCloudIcon />
					{!prepareDownload ? (
						'Prepare IDs'
					) : (
						<PDFDownloadLink
							document={<IdCardPdf idCards={idData} />}
							fileName='participant-ids.pdf'
						>
							{({ loading }) => (loading ? 'Loading IDs...' : 'Download IDs')}
						</PDFDownloadLink>
					)}
				</Button>,
				<ParticipantFormDialog key='create-participant'>
					<Button className='h-7'>Create Participant</Button>
				</ParticipantFormDialog>
			]}
		/>
	);
}
