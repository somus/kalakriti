import DataTableWrapper from '@/components/data-table-wrapper';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { User } from '@/views/UsersView/UsersView';
import { columns } from '@/views/UsersView/columns';
import { columnsConfig } from '@/views/UsersView/filters';
import LoadingScreen from '@/views/general/LoadingScreen';
import { useQuery } from '@rocicorp/zero/react';
import { useOutletContext } from 'react-router';

export default function CenterUsersView() {
	const { center } = useOutletContext<CenterOutletContext>();
	const zero = useZero();
	const [users, status] = useQuery(
		zero.query.users
			.where(({ or, exists }) =>
				or(
					exists('guardianCenters', q => q.where('centerId', center.id)),
					exists('liaisoningCenters', q => q.where('centerId', center.id))
				)
			)
			.orderBy('createdAt', 'desc')
	);

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
			columns={columns.filter(
				column =>
					column.id &&
					!['leading', 'canLogin', 'view-id-card', 'actions'].includes(
						column.id
					)
			)}
			columnsConfig={columnsConfig.filter(
				column =>
					column.id &&
					!['leading', 'canLogin', 'view-id-card', 'actions'].includes(
						column.id
					)
			)}
			columnsToHide={['center']}
		/>
	);
}
