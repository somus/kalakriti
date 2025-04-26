import { rolesEnum } from '@/db/schema';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import { z } from 'zod';

import { CenterPage } from './CenterView/CenterView';

export default function DashboardView() {
	const {
		user: { publicMetadata }
	} = useApp();
	const role = z.enum(rolesEnum.enumValues).parse(publicMetadata.role);
	const zero = useZero();
	const [center] = useQuery(
		zero.query.centers
			.related('guardians', q => q.related('user'))
			.related('liaisons', q => q.related('user'))
			.one()
	);

	if (role === 'guardian' && center) {
		return (
			<div className='w-full px-4'>
				<CenterPage
					// @ts-expect-error fix later
					center={center}
				/>
			</div>
		);
	}

	return (
		<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
			<div className='grid auto-rows-min gap-4 md:grid-cols-3'>
				<div className='aspect-video rounded-xl bg-muted/50' />
				<div className='aspect-video rounded-xl bg-muted/50' />
				<div className='aspect-video rounded-xl bg-muted/50' />
			</div>
			<div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
		</div>
	);
}
