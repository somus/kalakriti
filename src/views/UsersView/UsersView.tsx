import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { User } from '@/db/schema.zero';
import useTable from '@/hooks/useTable';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';

import UserFormDialog from './UserFormDialog';
import { columns } from './columns';

export default function UsersView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [users, status] = useQuery(z.query.users);
	const table = useTable<User>({ data: users as User[], columns });

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			table={table}
			additionalActions={[
				<UserFormDialog key='create-user'>
					<Button className='h-7'>Create User</Button>
				</UserFormDialog>
			]}
		/>
	);
}
