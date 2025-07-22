import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { Center } from '@/layout/CenterLayout';
import { Heading1Icon, ShieldUserIcon } from 'lucide-react';

const dtf = createColumnConfigHelper<Center>();

export const columnsConfig = [
	dtf
		.text()
		.id('name')
		.accessor(row => row.name)
		.displayName('Name')
		.icon(Heading1Icon)
		.build(),
	dtf
		.multiOption()
		.accessor(row => row.liaisons.map(liaison => liaison.user))
		.id('liaisons')
		.displayName('Liaisons')
		.icon(ShieldUserIcon)
		.transformOptionFn(data => {
			const liaison = data as unknown as Center['liaisons'][number]['user'];
			return {
				value: liaison?.id ?? '',
				label: liaison?.firstName + ' ' + liaison?.lastName
			};
		})
		.build(),
	dtf
		.multiOption()
		.accessor(row => row.guardians.map(guardian => guardian.user))
		.id('guardians')
		.displayName('Guardians')
		.icon(ShieldUserIcon)
		.transformOptionFn(data => {
			const guardian = data as unknown as Center['guardians'][number]['user'];
			return {
				value: guardian?.id ?? '',
				label: guardian?.firstName + ' ' + guardian?.lastName
			};
		})
		.build()
] as const;
