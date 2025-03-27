import { Link, Navigate, useLocation } from 'react-router';

import ErrorScreen from './general/ErrorScreen';

export const DefaultView = () => {
	const { pathname } = useLocation();

	if (pathname == '/') {
		return <Navigate to='/dashboard' replace={true} />;
	}

	return (
		<ErrorScreen>
			<p className='mb-4'>🚩 This page is not found</p>
			<Link className='text-t3 hover:underline' to='/dashboard'>
				Return to dashboard
			</Link>
		</ErrorScreen>
	);
};
