import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { createColumnHelper } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Calendar1Icon } from 'lucide-react';
import { Participant } from 'shared/db/schema.zero';

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
		cell: ({ row }) =>
			row.getCanSelect() ? (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={value => row.toggleSelected(!!value)}
					aria-label='Select row'
				/>
			) : (
				<Tooltip key='create-participant'>
					<TooltipTrigger asChild>
						<span>
							<Checkbox
								checked={row.getIsSelected()}
								onCheckedChange={value => row.toggleSelected(!!value)}
								aria-label='Select row'
								disabled
							/>
						</span>
					</TooltipTrigger>
					<TooltipContent>
						<div className='flex flex-col gap-2'>
							<p>
								Can&apos;t select this participant because of one of the reasons
							</p>
							<ul className='list-disc list-inside'>
								<li>Participant have reached their total event limit</li>
								<li>Participant have reached their category event limit</li>
								<li>Participant have a time conflict with the current event</li>
							</ul>
						</div>
					</TooltipContent>
				</Tooltip>
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
		cell: ({ row }) => (
			<div className='flex gap-2 items-center'>
				{row.getValue('age')}
				<Tooltip>
					<TooltipTrigger asChild>
						<Calendar1Icon className='size-4' />
					</TooltipTrigger>
					<TooltipContent>
						({formatDate(row.original.dob, 'dd LLL yyyy')})
					</TooltipContent>
				</Tooltip>
			</div>
		),
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
	})
];
