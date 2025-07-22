import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import useZero from '@/hooks/useZero';
import { Center } from '@/layout/CenterLayout';
import { useQuery } from '@rocicorp/zero/react';

import CenterFormDialog from './CenterFormDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

export default function CentersView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [centers, status] = useQuery(
		z.query.centers
			.related('guardians', q => q.related('user'))
			.related('liaisons', q => q.related('user'))
			.related('participants')
			.orderBy('createdAt', 'desc')
	);

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			data={centers as Center[]}
			columns={columns}
			columnsConfig={columnsConfig}
			getRowLink={row => `/centers/${row.original.id}`}
			additionalActions={[
				<CenterFormDialog key='create-center'>
					<Button className='h-7'>Create Center</Button>
				</CenterFormDialog>
			]}
		/>
	);
}
