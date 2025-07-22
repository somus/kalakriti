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
import { cn } from '@/lib/utils';
import {
	type ColumnDef,
	Row,
	RowData,
	type Table as TanstackTable,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable
} from '@tanstack/react-table';
import { CornerDownRightIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

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

export default function DataTableWrapper<
	TData extends { id: string; subRows?: TData[] }
>({
	data,
	columnsConfig,
	columns,
	disabledRows,
	selectedRows,
	additionalActions,
	children,
	className,
	enableRowSelection = false,
	columnsToHide = [],
	getRowLink
}: {
	data: TData[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columnsConfig: readonly ColumnConfig<TData, any, any, any>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columns: ColumnDef<TData, any>[];
	disabledRows?: string[];
	selectedRows?: string[];
	additionalActions?: React.ReactNode[];
	children?: (table: TanstackTable<TData>) => React.ReactNode;
	className?: string;
	enableRowSelection?: boolean;
	columnsToHide?: string[];
	getRowLink?: (row: Row<TData>) => string;
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
	} = useTableState({
		rowSelection: selectedRows?.reduce(
			(acc, id) => ({ ...acc, [id]: true }),
			{}
		),
		columnVisibility: columnsToHide.reduce(
			(acc, id) => ({ ...acc, [id]: false }),
			{}
		)
	});

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
		getRowId: row => row.id,
		getSubRows: row => row.subRows,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		getExpandedRowModel: getExpandedRowModel(),
		// eslint-disable-next-line
		onPaginationChange: setPagination,
		autoResetPageIndex: false,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		enableRowSelection: disabledRows
			? row => !disabledRows.includes(row.original?.id)
			: enableRowSelection,
		filterFromLeafRows: true,
		maxLeafRowFilterDepth: 1,
		state: {
			sorting,
			columnFilters: tstFilters,
			columnVisibility,
			rowSelection,
			pagination,
			expanded: true
		}
	});
	const navigate = useNavigate();

	return (
		<>
			<div
				className={cn('w-full col-span-2 px-4 flex flex-col flex-1', className)}
			>
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
				<div className='rounded-md border bg-white dark:bg-inherit flex-[1_1_0] overflow-auto'>
					<Table containerClassName='overflow-x-visible'>
						<TableHeader className='sticky top-0 bg-muted shadow'>
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
										className={`h-[41px] ${getRowLink ? 'cursor-pointer' : ''}`}
										onClick={event => {
											if (getRowLink) {
												const link = getRowLink(row);
												if (event.metaKey || event.ctrlKey) {
													const win = window.open(link, '_blank');
													win?.focus();
												} else {
													navigate(link)?.catch(() => {
														console.error('Failed to navigate');
													});
												}
											}
										}}
									>
										{row.getVisibleCells().map((cell, key) => (
											<TableCell key={cell.id}>
												<div
													className={
														key === 0 && row.depth > 0
															? `flex pl-${row.depth * 4} gap-1`
															: ''
													}
												>
													{key === 0 && row.depth > 0 && (
														<CornerDownRightIcon className='size-4' />
													)}
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</div>
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
				<div className='flex flex-col gap-2.5 py-3'>
					<DataTablePagination
						table={table}
						enableRowSelection={enableRowSelection}
					/>
				</div>
			</div>
			{children?.(table)}
		</>
	);
}
