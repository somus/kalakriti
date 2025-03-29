import { DataTableFilter } from '@/components/data-table-filter';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { type Table as TanStackTable, flexRender } from '@tanstack/react-table';

import { DataTableViewOptions } from './data-table-view-options';

export default function DataTableWrapper<TData>({
	table
}: {
	table: TanStackTable<TData>;
}) {
	// eslint-disable-next-line react-compiler/react-compiler
	'use no memo';
	return (
		<div className='w-full px-4'>
			<div className='flex items-center py-4 gap-2'>
				<DataTableFilter table={table} />
				<DataTableViewOptions table={table} />
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
			<div className='flex items-center justify-end space-x-2 py-4'>
				<div className='flex-1 text-sm text-muted-foreground tabular-nums'>
					{table.getFilteredSelectedRowModel().rows.length} of{' '}
					{table.getFilteredRowModel().rows.length} row(s) selected.{' '}
					<span className='text-primary font-medium'>
						Total row count: {table.getCoreRowModel().rows.length}
					</span>
				</div>
				<div className='space-x-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
