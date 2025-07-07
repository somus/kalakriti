import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react';
import { useOutletContext } from 'react-router';
import { toast } from 'sonner';

import { SubEventParticipant } from './CenterEventView';

const columnHelper = createColumnHelper<SubEventParticipant>();

export const columns = [
	columnHelper.accessor(row => row.participant?.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Name' />
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('name')}</div>,
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
	const context = useOutletContext<CenterOutletContext>();
	const z = useZero();
	const {
		user: { role }
	} = useApp();

	return (
		<Button
			variant='ghost'
			aria-label='Delete participant from event'
			className='flex size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive *:[svg]:!text-destructive'
			disabled={!!context?.center?.isLocked && role !== 'admin'}
			onClick={() => {
				z.mutate.subEventParticipants
					.delete({
						id: participantId
					})
					.server.catch((e: Error) => {
						toast.error('Error deleting participant from event', {
							description: e.message || 'Something went wrong'
						});
					});
			}}
		>
			<TrashIcon />
		</Button>
	);
};
