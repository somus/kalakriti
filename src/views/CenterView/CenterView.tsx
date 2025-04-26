import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, useParams } from 'react-router';

export default function CenterView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
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

	console.log(center);

	return <h2>{center.name}</h2>;
}
