import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import { Center } from '@/db/schema.zero';
import useTable from '@/hooks/useTable';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';

import CenterFormDialog from './CenterFormDialog';
import { columns } from './columns';

export default function CentersView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [centers, status] = useQuery(
		z.query.centers
			.related('guardians', q => q.related('user'))
			.related('liaisons', q => q.related('user'))
	);
	const table = useTable<Center>({ data: centers as Center[], columns });

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			table={table}
			additionalActions={[
				<CenterFormDialog key='create-center'>
					<Button className='h-7'>Create Center</Button>
				</CenterFormDialog>
			]}
		/>
	);
}
