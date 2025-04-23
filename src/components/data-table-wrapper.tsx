import { DataTableFilter } from '@/components/data-table-filter';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { type Table as TanStackTable, flexRender } from '@tanstack/react-table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableViewOptions } from './data-table-view-options';

export default function DataTableWrapper<TData>({
	table,
	additionalActions
}: {
	table: TanStackTable<TData>;
	additionalActions?: React.ReactNode[];
}) {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	return (
		<div className='w-full px-4'>
			<div className='flex items-center py-4 gap-2'>
				<DataTableFilter table={table} />
				<DataTableViewOptions table={table} />
				{additionalActions}
			</div>
			<div className='rounded-md border bg-white dark:bg-inherit'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead
											key={header.id}
											onClick={header.column.getToggleSortingHandler()}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getAllColumns().length}
									className='h-24 text-center'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className='flex flex-col gap-2.5'>
				<DataTablePagination table={table} />
			</div>
		</div>
	);
}
