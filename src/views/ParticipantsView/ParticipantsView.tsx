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
	'use no memo';

	const zero = useZero();
	const [participants, status] = useQuery(participantsQuery(zero));
	// const [prepareDownload, setPrepareDownload] = useState(false);

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
		<div className='relative flex flex-1'>
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
			{/*{table => {
					const idData = table.getRowModel().rows.map(row => ({
						name: row.original.name,
						role: `${row.original.center?.name ?? 'Participant'} - ${row.original.participantCategory?.name ?? 'No Category'}`,
						qrCodeValue: JSON.stringify({
							type: 'participant',
							id: row.original.id
						}),
						type: 'participant'
					})) as IdCardData[];
					return (
						<Button
							className='h-7 absolute top-4 right-[316px]'
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
									{({ loading }) =>
										loading ? 'Loading IDs...' : 'Download IDs'
									}
								</PDFDownloadLink>
							)}
						</Button>
					);
				}}
			</DataTableWrapper>*/}
		</div>
	);
}
