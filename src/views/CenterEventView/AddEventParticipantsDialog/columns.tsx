import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Participant } from '@/db/schema.zero';
import { createColumnHelper } from '@tanstack/react-table';

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
	})
];
