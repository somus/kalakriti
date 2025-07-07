import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import useZero from '@/hooks/useZero';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { ParticipantCategory } from 'shared/db/schema.zero';
import { toast } from 'sonner';

import ParticipantCategoryFormDialog from './ParticipantCategoryFormDialog';

const columnHelper = createColumnHelper<ParticipantCategory>();

export const columns = [
	columnHelper.accessor(row => row.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Name' />
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('name')}</div>
	}),
	columnHelper.accessor(row => row.minAge, {
		id: 'minAge',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Min Age' />
		),
		cell: ({ row }) => <div>{row.getValue('minAge')}</div>
	}),
	columnHelper.accessor(row => row.maxAge, {
		id: 'maxAge',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Max Age' />
		),
		cell: ({ row }) => <div>{row.getValue('maxAge')}</div>
	}),
	columnHelper.accessor(row => row.maxBoys, {
		id: 'maxBoys',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Max Boys Count' />
		),
		cell: ({ row }) => <div>{row.getValue('maxBoys')}</div>
	}),
	columnHelper.accessor(row => row.maxGirls, {
		id: 'maxGirls',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Max Girls Count' />
		),
		cell: ({ row }) => <div>{row.getValue('maxGirls')}</div>
	}),
	columnHelper.accessor(row => row.totalEventsAllowed, {
		id: 'totalEventsAllowed',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Total Events Allowed' />
		),
		cell: ({ row }) => <div>{row.getValue('totalEventsAllowed')}</div>
	}),
	columnHelper.accessor(row => row.maxEventsPerCategory, {
		id: 'maxEventsPerCategory',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Max Events Per Category' />
		),
		cell: ({ row }) => <div>{row.getValue('maxEventsPerCategory')}</div>
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<ParticipantCategory> }) => {
			return <Actions participantCategory={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({
	participantCategory
}: {
	participantCategory: ParticipantCategory;
}) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const z = useZero();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label='Open menu'
					variant='ghost'
					className='flex size-8 p-0 data-[state=open]:bg-muted'
				>
					<Ellipsis className='size-4' aria-hidden='true' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					variant='destructive'
					onSelect={() => {
						z.mutate.participantCategories
							.delete({
								id: participantCategory.id
							})
							.server.catch((e: Error) => {
								toast.error('Error deleting participant category', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
			{isDialogOpen && (
				<ParticipantCategoryFormDialog
					participantCategory={participantCategory}
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				/>
			)}
		</DropdownMenu>
	);
};
