import { User } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';

import UsersTable from './table/users-table';

export default function UsersView() {
	const z = useZero();
	const [users, status] = useQuery(z.query.users);

	if (status.type !== 'complete') {
		return null;
	}

	return <UsersTable users={users as User[]} />;
}
