import { Center } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, Outlet, useParams } from 'react-router';

export interface CenterOutletContext {
	center: Center;
}

export default function CenterLayout() {
	const params = useParams();
	const z = useZero();
	const centerId = params.id;
	const [center, status] = useQuery(
		z.query.centers
			.where('id', centerId ?? '')
			.related('guardians', q => q.related('user'))
			.related('liaisons', q => q.related('user'))
			.one()
	);

	if (!centerId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete' || !center) {
		return null;
	}

	return (
		<div className='w-full px-4'>
			<Outlet context={{ center }} />
		</div>
	);
}
