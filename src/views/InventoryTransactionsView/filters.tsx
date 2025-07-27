import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import startCase from 'lodash/startCase';
import {
	CalculatorIcon,
	ContainerIcon,
	Heading1Icon,
	NotebookPenIcon,
	ShieldUserIcon
} from 'lucide-react';

import { InventoryTransaction } from './InventoryTransactionsView';

const dtf = createColumnConfigHelper<InventoryTransaction>();

export const columnsConfig = [
	dtf
		.text()
		.id('name')
		.accessor(row => row.inventory?.name)
		.displayName('Name')
		.icon(Heading1Icon)
		.build(),
	dtf
		.number()
		.id('quantity')
		.accessor(row => row.quantity)
		.displayName('Quantity')
		.icon(ContainerIcon)
		.build(),
	dtf
		.option()
		.id('type')
		.accessor(row => row.type)
		.displayName('Type')
		.icon(CalculatorIcon)
		.transformOptionFn(c => ({
			value: c,
			label: startCase(c)
		}))
		.build(),
	dtf
		.text()
		.id('notes')
		.accessor(row => row.notes)
		.displayName('Notes')
		.icon(NotebookPenIcon)
		.build(),
	dtf
		.option()
		.accessor(row => row.event)
		.id('event')
		.displayName('Event')
		.icon(ShieldUserIcon)
		.transformOptionFn(c => ({
			value: c.id,
			label: c.name
		}))
		.build()
] as const;
