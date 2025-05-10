import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { Heading1Icon, ShieldUserIcon } from 'lucide-react';

import { EventCategory } from './EventCategoriesView';

const dtf = createColumnConfigHelper<EventCategory>();

export const columnsConfig = [
	dtf
		.text()
		.id('name')
		.accessor(row => row.name)
		.displayName('Name')
		.icon(Heading1Icon)
		.build(),
	dtf
		.option()
		.accessor(row => row.coordinator)
		.id('coordinator')
		.displayName('Coordinator')
		.icon(ShieldUserIcon)
		.transformOptionFn(c => ({
			value: c.id,
			label: c.firstName + ' ' + c.lastName
		}))
		.build()
] as const;
