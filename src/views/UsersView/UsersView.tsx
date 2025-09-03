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

import UserFormDialog from './UserFormDialog';
import { columns, getUserRoleText } from './columns';
import { columnsConfig } from './filters';

function usersQuery(z: Zero) {
	return z.query.users
		.related('coordinatingEvents', q => q.related('event'))
		.related('guardianCenters', q => q.related('center'))
		.related('liaisoningCenters', q => q.related('center'))
		.related('volunteeringEvents', q => q.related('event'))
		.orderBy('createdAt', 'desc');
}

export type User = Row<ReturnType<typeof usersQuery>>;

export default function UsersView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [users, status] = useQuery(usersQuery(z));
	const [prepareDownload, setPrepareDownload] = useState(false);

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!users) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load users</p>
				</p>
			</div>
		);
	}

	const idData = users
		.map(user => ({
			name: `${user.firstName} ${user.lastName}`,
			role: getUserRoleText(user),
			qrCodeValue: JSON.stringify({
				type: user.role === 'guardian' ? 'guardian' : 'volunteer',
				id: user.id
			}),
			type: user.role === 'guardian' ? 'guardian' : 'volunteer'
		}))
		.sort((a, b) => a.type.localeCompare(b.type)) as IdCardData[];

	return (
		<DataTableWrapper
			data={users as User[]}
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
							fileName='user-ids.pdf'
						>
							{({ loading }) => (loading ? 'Loading IDs...' : 'Download IDs')}
						</PDFDownloadLink>
					)}
				</Button>,
				<UserFormDialog key='create-user'>
					<Button className='h-7'>Create User</Button>
				</UserFormDialog>
			]}
		/>
	);
}
