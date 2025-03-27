import { useQuery, useZero } from '@rocicorp/zero/react';

export function UsersView() {
	const z = useZero();
	const [users, status] = useQuery(z.query.users);

	if (status.type !== 'complete') {
		return null;
	}

	console.log({ users });

	return <h1>Users</h1>;
}
