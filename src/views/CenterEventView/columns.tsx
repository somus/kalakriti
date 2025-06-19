import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react';
import { useOutletContext } from 'react-router';

import { SubEventParticipant } from './CenterEventView';

const columnHelper = createColumnHelper<SubEventParticipant>();

export const columns = [
	columnHelper.display({
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={value => table.toggleAllRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={value => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false
	}),
	columnHelper.accessor(row => row.participant?.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
		cell: ({ row }) => <div>{row.getValue('name')}</div>,
		sortingFn: 'alphanumeric',
		meta: {
			displayName: 'Name'
		}
	}),
	columnHelper.accessor(row => row.participant?.age, {
		id: 'age',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Age' />
		),
		cell: ({ row }) => <div>{row.getValue('age')}</div>,
		meta: {
			displayName: 'Age'
		}
	}),
	columnHelper.accessor(row => row.participant?.gender, {
		id: 'gender',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Gender' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>{row.getValue('gender')}</div>
		),
		meta: {
			displayName: 'Gender'
		}
	}),
	columnHelper.accessor(row => (row.attended ?? false).toString(), {
		id: 'attended',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Attended' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{row.getValue('attended') === 'true' ? (
					<CheckIcon className='size-5 text-green-500' />
				) : (
					<XIcon className='size-5 text-destructive' />
				)}
			</div>
		),
		meta: {
			displayName: 'Attended'
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<SubEventParticipant> }) => {
			return <Actions participantId={row.original.id} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ participantId }: { participantId: string }) => {
	const { center } = useOutletContext<CenterOutletContext>();
	const z = useZero();

	return (
		<Button
			variant='ghost'
			aria-label='Delete participant from event'
			className='flex size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive *:[svg]:!text-destructive'
			disabled={center.isLocked ?? false}
			onClick={() => {
				z.mutate.subEventParticipants
					.delete({
						id: participantId
					})
					.catch(e => console.log('Failed to delete participant', e));
			}}
		>
			<TrashIcon />
		</Button>
	);
};
