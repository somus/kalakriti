import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, Outlet, useParams } from 'react-router';
import * as z from 'zod';

// eslint-disable-next-line react-refresh/only-export-components
export function centerQuery(z: Zero, centerId: string) {
	return z.query.centers
		.where('id', centerId)
		.related('guardians', q => q.related('user'))
		.related('liaisons', q => q.related('user'))
		.related('participants', q => q.related('participantCategory'))
		.one();
}

export type Center = NonNullable<Row<ReturnType<typeof centerQuery>>>;

export interface CenterOutletContext {
	center: Center;
}

export default function CenterLayout() {
	const params = useParams();
	const zero = useZero();
	const centerId = z.cuid2().parse(params.centerId);
	const [center, status] = useQuery(centerQuery(zero, centerId));

	if (!centerId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!center) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load center details</p>
				</p>
			</div>
		);
	}

	return <Outlet context={{ center }} />;
}
