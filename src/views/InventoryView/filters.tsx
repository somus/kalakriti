import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import {
	ContainerIcon,
	Heading1Icon,
	IndianRupeeIcon,
	ShieldUserIcon
} from 'lucide-react';

import { Inventory } from './InventoryView';

const dtf = createColumnConfigHelper<Inventory>();

export const columnsConfig = [
	dtf
		.text()
		.id('name')
		.accessor(row => row.name)
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
		.number()
		.id('unitPrice')
		.accessor(row => row.unitPrice)
		.displayName('Unit Price')
		.icon(IndianRupeeIcon)
		.build(),
	dtf
		.number()
		.id('totalPrice')
		.accessor(row => row.unitPrice * row.quantity)
		.displayName('Total Price')
		.icon(IndianRupeeIcon)
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
