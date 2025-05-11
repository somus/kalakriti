import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, Outlet, useParams } from 'react-router';
import { z } from 'zod';

function centerQuery(z: Zero<Schema>, centerId: string) {
	return z.query.centers
		.where('id', centerId)
		.related('guardians', q => q.related('user'))
		.related('liaisons', q => q.related('user'))
		.one();
}

export type Center = NonNullable<Row<ReturnType<typeof centerQuery>>>;

export interface CenterOutletContext {
	center: Center;
}

export default function CenterLayout() {
	const params = useParams();
	const zero = useZero();
	const centerId = z.string().cuid2().parse(params.centerId);
	const [center, status] = useQuery(centerQuery(zero, centerId));

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
