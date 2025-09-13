import { DataTableColumnHeader } from '@/components/data-table-column-header';
import DataTableWrapper from '@/components/data-table-wrapper';
import { Badge } from '@/components/ui/badge';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { createColumnHelper } from '@tanstack/react-table';

import { columns } from '../UsersView/columns';
import { columnsConfig } from '../UsersView/filters';

const columnHelper = createColumnHelper<User>();

function liaisonsQuery(z: Zero) {
	return (
		z.query.users
			// eslint-disable-next-line @typescript-eslint/unbound-method
			.where(({ cmp, or, exists }) =>
				or(
					cmp('leading', 'liaison'),
					exists('liaisoningCenters', q => q.where('centerId', '!=', ''))
				)
			)
			.related('coordinatingEvents', q => q.related('event'))
			.related('guardianCenters', q => q.related('center'))
			.related('liaisoningCenters', q => q.related('center'))
			.related('volunteeringEvents', q => q.related('event'))
			.orderBy('createdAt', 'desc')
	);
}

export type User = Row<ReturnType<typeof liaisonsQuery>>;

export default function UsersView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [users, status] = useQuery(liaisonsQuery(z));

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!users) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load liaisons</p>
				</p>
			</div>
		);
	}

	const filteredColumns = columns.filter(
		c => !['canLogin', 'hadBreakfast', 'hadLunch'].includes(c.id!)
	);
	const updatedColumns = [
		...filteredColumns.slice(0, 5), // Elements before the insert index
		columnHelper.accessor(
			row => row.liaisoningCenters.map(center => center.center),
			{
				id: 'centers',
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title='Centers' />
				),
				cell: ({ row }) => {
					const centers = row.getValue<
						User['liaisoningCenters'][number]['center'][] | undefined
					>('centers');
					return centers ? (
						<div className='flex gap-1'>
							{centers.map(center => (
								<Badge variant='outline' key={center?.id}>
									{center?.name}
								</Badge>
							))}
						</div>
					) : null;
				}
			}
		), // The new element
		...filteredColumns.slice(5) // Elements from the insert index onwards
	];

	return (
		<div className='relative flex flex-1'>
			<DataTableWrapper
				data={users as User[]}
				columns={updatedColumns}
				columnsConfig={columnsConfig}
			/>
		</div>
	);
}
