import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/useApp';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import UserFormDialog from './UserFormDialog';
import { columns } from './columns';
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
	'use no memo';
	const z = useZero();
	const [users, status] = useQuery(usersQuery(z));
	// const [prepareDownload, setPrepareDownload] = useState(false);
	const {
		user: { role, leading }
	} = useApp();
	const isAdmin = role === 'admin';

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

	let filteredUsers = users;
	if (role === 'volunteer') {
		filteredUsers = users.filter(
			user => user.team === leading || user.leading === leading
		);
	}

	return (
		<div className='relative flex flex-1'>
			<DataTableWrapper
				data={filteredUsers as User[]}
				columns={columns}
				columnsConfig={columnsConfig}
				additionalActions={
					isAdmin
						? [
								<UserFormDialog key='create-user'>
									<Button className='h-7'>Create User</Button>
								</UserFormDialog>
							]
						: []
				}
			/>
			{/*{table => {
					if (!isAdmin) {
						return null;
					}

					const idData = table
						.getRowModel()
						.rows.map(row => ({
							name: `${row.original.firstName} ${row.original.lastName ?? ''}`,
							role: getUserRoleText(row.original),
							qrCodeValue: JSON.stringify({
								type:
									row.original.role === 'admin'
										? 'volunteer'
										: row.original.role!,
								id: row.original.id
							}),
							type:
								row.original.role === 'admin' ? 'volunteer' : row.original.role!
						}))
						.sort((a, b) => a.type.localeCompare(b.type)) as IdCardData[];
					// const volunteerData = Array.from({ length: 120 }, () => ({
					// 	qrCodeValue: JSON.stringify({
					// 		type: 'volunteer',
					// 		id: createId(),
					// 		isNewUser: true
					// 	}),
					// 	type: 'volunteer'
					// }));
					// const guestData = Array.from({ length: 20 }, () => ({
					// 	qrCodeValue: JSON.stringify({
					// 		type: 'guest',
					// 		id: createId(),
					// 		isNewUser: true
					// 	}),
					// 	type: 'guest'
					// }));
					// const judgeData = Array.from({ length: 60 }, () => ({
					// 	qrCodeValue: JSON.stringify({
					// 		type: 'judge',
					// 		id: createId(),
					// 		isNewUser: true
					// 	}),
					// 	type: 'judge'
					// }));

					return (
						<Button
							className='h-7 absolute top-4 right-[256px]'
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
