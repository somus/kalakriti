import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import { User } from 'shared/db/schema.zero';

import UserFormDialog from './UserFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

export default function UsersView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [users, status] = useQuery(z.query.users);

	if (status.type !== 'complete') {
		return null;
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
