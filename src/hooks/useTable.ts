import {
	dataTableFilterQuerySchema,
	initializeFiltersFromQuery
} from '@/lib/filters';
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable
} from '@tanstack/react-table';
import { parseAsJson, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';

export default function useTable<T>({
	data,
	columns
}: {
	data: T[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columns: ColumnDef<T, any>[];
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [queryFilters, setQueryFilters] = useQueryState(
		'filter',
		// eslint-disable-next-line @typescript-eslint/unbound-method
		parseAsJson(dataTableFilterQuerySchema.parse).withDefault([])
	);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
		initializeFiltersFromQuery(queryFilters, columns as ColumnDef<T>[])
	);
	const [globalFilter, setGlobalFilter] = useState('');
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [pagination, setPagination] = useState({
		pageIndex: 0, //initial page index
		pageSize: 10 //default page size
	});

	useEffect(() => {
		setQueryFilters(
			columnFilters.map(f => ({
				id: f.id,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
				value: { ...(f.value as any), columnMeta: undefined }
			}))
		).catch(e => console.error('Error setting url query filter params', e));
	}, [columnFilters, setQueryFilters]);

	return useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			globalFilter,
			columnVisibility,
			rowSelection,
			pagination
		},
		filterFns: {
			// fuzzy: fuzzyFilter,
		}
	});
}
