import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import {
	ContainerIcon,
	Heading1Icon,
	IndianRupeeIcon,
	TicketsIcon
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
		.multiOption()
		.accessor(row => row.events.map(event => event.event))
		.id('events')
		.displayName('Events')
		.icon(TicketsIcon)
		.transformOptionFn(data => {
			const event = data as unknown as Inventory['events'][number]['event'];
			return {
				value: event?.id ?? '',
				label: event?.name ?? ''
			};
		})
		.build()
] as const;
