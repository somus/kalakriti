import { FiltersState } from '@/components/data-table-filter/core/types';
import {
	PaginationState,
	SortingState,
	VisibilityState
} from '@tanstack/react-table';
import {
	parseAsIndex,
	parseAsInteger,
	parseAsJson,
	useQueryState,
	useQueryStates
} from 'nuqs';
import { useState } from 'react';
import * as z from 'zod';

const filtersSchema = z.custom<FiltersState>();

export default function useTableState(
	defaultState: {
		columnVisibility?: VisibilityState;
		rowSelection?: Record<string, boolean>;
		sorting?: SortingState;
		filters?: FiltersState;
		pagination?: PaginationState;
	} = {}
) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		defaultState.columnVisibility ?? {}
	);
	const [rowSelection, setRowSelection] = useState(
		defaultState.rowSelection ?? {}
	);
	const [pagination, setPagination] = useQueryStates(
		{
			pageIndex: parseAsIndex.withDefault(
				defaultState.pagination?.pageIndex ?? 0
			),
			pageSize: parseAsInteger.withDefault(
				defaultState.pagination?.pageSize ?? 10
			)
		},
		{
			urlKeys: {
				pageIndex: 'page',
				pageSize: 'size'
			}
		}
	);
	const [sorting, setSorting] = useState<SortingState>(
		defaultState.sorting ?? []
	);
	const [queryFilters, setQueryFilters] = useQueryState<FiltersState>(
		'filters',
		// eslint-disable-next-line @typescript-eslint/unbound-method
		parseAsJson(filtersSchema.parse).withDefault(defaultState.filters ?? [])
	);

	const updateFilters: typeof setQueryFilters = async filters => {
		await setPagination(old => ({
			...old,
			pageIndex: 0
		}));
		return await setQueryFilters(filters);
	};

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
			setQueryFilters: updateFilters
		}
	};
}
