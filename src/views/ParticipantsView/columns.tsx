import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router';

import ParticipantFormDialog from './ParticipantFormDialog';
import { Participant } from './ParticipantsView';

const columnHelper = createColumnHelper<Participant>();

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
	columnHelper.accessor(row => row.name, {
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
	columnHelper.accessor(row => row.age, {
		id: 'age',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Age' />
		),
		cell: ({ row }) => <div>{row.getValue('age')}</div>,
		meta: {
			displayName: 'Age'
		}
	}),
	columnHelper.accessor(row => row.gender, {
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
	columnHelper.accessor(row => row.participantCategory, {
		id: 'participantCategory',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Participant Category' />
		),
		cell: ({ row }) => {
			const participantCategory = row.getValue<
				Participant['participantCategory'] | undefined
			>('participantCategory');
			return participantCategory ? (
				<Badge variant='outline'>{participantCategory.name}</Badge>
			) : null;
		},
		enableSorting: false,
		meta: {
			displayName: 'Participant Category'
		}
	}),
	columnHelper.accessor(row => row.center, {
		id: 'center',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Center' />
		),
		cell: ({ row }) => {
			const center = row.getValue<Participant['center'] | undefined>('center');
			return center ? <Badge variant='outline'>{center.name}</Badge> : null;
		},
		enableSorting: false,
		meta: {
			displayName: 'Center'
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<Participant> }) => {
			return <Actions participant={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ participant }: { participant: Participant }) => {
	const { center } = useOutletContext<CenterOutletContext>();
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
				<DropdownMenuItem
					onSelect={() => setIsDialogOpen(true)}
					disabled={center.isLocked ?? false}
				>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					variant='destructive'
					onSelect={() => {
						Promise.all([
							z.mutate.participants.delete({
								id: participant.id
							})
						]).catch(e => {
							console.log('Failed to delete participant', e);
						});
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
			<ParticipantFormDialog
				participant={participant}
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</DropdownMenu>
	);
};
