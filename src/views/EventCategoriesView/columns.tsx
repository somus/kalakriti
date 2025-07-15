import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropDrawer,
	DropDrawerContent,
	DropDrawerItem,
	DropDrawerTrigger
} from '@/components/ui/dropdrawer';
import useZero from '@/hooks/useZero';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { EventCategory } from './EventCategoriesView';
import EventCategoryFormDialog from './EventCategoryFormDialog';

const columnHelper = createColumnHelper<EventCategory>();

export const columns = [
	columnHelper.accessor(row => row.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Name' />
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('name')}</div>
	}),
	columnHelper.accessor(row => row.coordinator, {
		id: 'coordinator',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Coordinator' />
		),
		cell: ({ row }) => {
			const coordinator = row.getValue<
				EventCategory['coordinator'] | undefined
			>('coordinator');
			return coordinator ? (
				<Badge variant='outline'>
					{coordinator.firstName} {coordinator.lastName ?? ''}
				</Badge>
			) : null;
		},
		enableSorting: false
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<EventCategory> }) => {
			return <Actions eventCategory={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ eventCategory }: { eventCategory: EventCategory }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const z = useZero();

	return (
		<DropDrawer modal={false}>
			<DropDrawerTrigger asChild>
				<Button
					aria-label='Open menu'
					variant='ghost'
					className='flex size-8 p-0 data-[state=open]:bg-muted'
				>
					<Ellipsis className='size-4' aria-hidden='true' />
				</Button>
			</DropDrawerTrigger>
			<DropDrawerContent align='end'>
				<DropDrawerItem onSelect={() => setIsDialogOpen(true)}>
					Edit
				</DropDrawerItem>
				<DropDrawerItem
					variant='destructive'
					onSelect={() => {
						z.mutate.eventCategories
							.delete({
								id: eventCategory.id
							})
							.server.catch((e: Error) => {
								toast.error('Error deleting event category', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					Delete
				</DropDrawerItem>
			</DropDrawerContent>
			{isDialogOpen && (
				<EventCategoryFormDialog
					eventCategory={eventCategory}
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				/>
			)}
		</DropDrawer>
	);
};
