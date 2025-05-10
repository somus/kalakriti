import { useDataTableFilters } from '@/components/data-table-filter/hooks/use-data-table-filters';
import {
	createTSTColumns,
	createTSTFilters
} from '@/components/data-table-filter/integrations/tanstack-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import useTableState from '@/hooks/useTableState';
import {
	type ColumnDef,
	RowData,
	flexRender,
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable
} from '@tanstack/react-table';
import { useMemo } from 'react';

import { ColumnConfig } from './data-table-filter/core/types';
import { DataTableFilter } from './data-table-filter/index';
import { DataTablePagination } from './data-table-pagination';
import { DataTableViewOptions } from './data-table-view-options';

declare module '@tanstack/react-table' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData extends RowData, TValue> {
		displayName: string;
	}
}

export default function DataTableWrapper<TData>({
	data,
	columnsConfig,
	columns,
	additionalActions
}: {
	data: TData[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columnsConfig: readonly ColumnConfig<TData, any, any, any>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columns: ColumnDef<TData, any>[];
	additionalActions?: React.ReactNode[];
}) {
	'use no memo';

	const {
		state: {
			queryFilters,
			sorting,
			columnVisibility,
			rowSelection,
			pagination
		},
		actions: {
			setSorting,
			setPagination,
			setQueryFilters,
			setRowSelection,
			setColumnVisibility
		}
	} = useTableState();

	const {
		columns: filterColumns,
		filters,
		actions,
		strategy
	} = useDataTableFilters({
		strategy: 'client',
		data,
		columnsConfig,
		filters: queryFilters,
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		onFiltersChange: setQueryFilters
	});

	const tstColumns = useMemo(
		() =>
			createTSTColumns({
				columns,
				configs: filterColumns
			}),
		// eslint-disable-next-line react-hooks/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filterColumns]
	);
	const memoData = useMemo(() => data, [data]);

	const tstFilters = useMemo(() => createTSTFilters(filters), [filters]);

	const table = useReactTable({
		data: memoData,
		columns: tstColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		onPaginationChange: setPagination,
		autoResetPageIndex: true,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters: tstFilters,
			columnVisibility,
			rowSelection,
			pagination
		}
	});

	return (
		<div className='w-full col-span-2 px-4'>
			<div className='flex items-center py-4 gap-2 flex-wrap'>
				<DataTableFilter
					filters={filters}
					columns={filterColumns}
					actions={actions}
					strategy={strategy}
				/>
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
