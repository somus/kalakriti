import DataTableWrapper from '@/components/data-table-wrapper';
import useZero from '@/hooks/useZero';
import { columns } from '@/views/UsersView/columns';
import { columnsConfig } from '@/views/UsersView/filters';
import { useQuery } from '@rocicorp/zero/react';
import { User } from 'shared/db/schema.zero';

export default function CenterUsersView() {
	const zero = useZero();
	const [users, status] = useQuery(
		zero.query.users.orderBy('createdAt', 'desc')
	);

	if (status.type !== 'complete') {
		return null;
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
