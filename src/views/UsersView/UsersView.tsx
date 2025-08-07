import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
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
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [users, status] = useQuery(usersQuery(z));

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

	return (
		<DataTableWrapper
			data={users as User[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
				<UserFormDialog key='create-user'>
					<Button className='h-7'>Create User</Button>
				</UserFormDialog>
			]}
		/>
	);
}
