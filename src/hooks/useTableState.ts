import { FiltersState } from '@/components/data-table-filter/core/types';
import { SortingState, VisibilityState } from '@tanstack/react-table';
import { parseAsJson, useQueryState } from 'nuqs';
import { useState } from 'react';
import * as z from 'zod/v4';

const filtersSchema = z.custom<FiltersState>();

export default function useTableState() {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [pagination, setPagination] = useState({
		pageIndex: 0, //initial page index
		pageSize: 10 //default page size
	});
	const [sorting, setSorting] = useState<SortingState>([]);
	const [queryFilters, setQueryFilters] = useQueryState<FiltersState>(
		'filters',
		// eslint-disable-next-line @typescript-eslint/unbound-method
		parseAsJson(filtersSchema.parse).withDefault([])
	);

	return {
		state: {
			columnVisibility,
			rowSelection,
			pagination,
			sorting,
			queryFilters
		},
		actions: {
			setColumnVisibility,
			setRowSelection,
			setPagination,
			setSorting,
			setQueryFilters
		}
	};
}
