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
import { defineMeta, filterFn } from '@/lib/filters';
import { Row, createColumnHelper } from '@tanstack/react-table';
import {
	CalendarIcon,
	CircleSmall,
	ComponentIcon,
	Ellipsis,
	Heading1Icon,
	SchoolIcon
} from 'lucide-react';
import { useState } from 'react';

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
		meta: {
			displayName: 'Name',
			type: 'text',
			icon: Heading1Icon
		},
		filterFn: filterFn('text'),
		sortingFn: 'alphanumeric'
	}),
	columnHelper.accessor(row => row.age, {
		id: 'age',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Age' />
		),
		cell: ({ row }) => <div>{row.getValue('age')}</div>,
		meta: {
			displayName: 'Age',
			type: 'number',
			icon: CalendarIcon,
			max: 30
		},
		filterFn: filterFn('number'),
		sortingFn: 'alphanumeric'
	}),
	columnHelper.accessor(row => row.gender, {
		id: 'gender',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Gender' />
		),
		cell: ({ row }) => <div>{row.getValue('gender')}</div>,
		meta: {
			displayName: 'Gender',
			type: 'option',
			icon: CircleSmall,
			options: [
				{ label: 'Male', value: 'male' },
				{ label: 'Female', value: 'female' }
			]
		},
		filterFn: filterFn('option'),
		sortingFn: 'text'
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
		filterFn: filterFn('option'),
		enableSorting: false,
		meta: defineMeta(row => row.participantCategory, {
			displayName: 'Participant Category',
			type: 'option',
			icon: ComponentIcon,
			transformOptionFn(data) {
				return {
					value: data.id,
					label: data.name
				};
			}
		})
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
		filterFn: filterFn('option'),
		enableSorting: false,
		meta: defineMeta(row => row.center, {
			displayName: 'Center',
			type: 'option',
			icon: SchoolIcon,
			transformOptionFn(data) {
				return {
					value: data.id,
					label: data.name
				};
			}
		})
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
