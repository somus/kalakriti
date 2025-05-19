import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { format } from 'date-fns';
import {
	ComponentIcon,
	HashIcon,
	Heading1Icon,
	ShieldUserIcon,
	TimerIcon
} from 'lucide-react';

// import { getTimeOptions } from './EventFormDialog';
import { Event } from './EventsView';

const dtf = createColumnConfigHelper<Event>();

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
		.id('startTime')
		.accessor(row => row.startTime)
		.displayName('Start Time')
		.icon(TimerIcon)
		// .options(getTimeOptions())
		.transformOptionFn(data => {
			const time = format(data, 'HH:mm');

			return {
				value: time,
				label: time
			};
		})
		.build(),
	dtf
		.option()
		.id('endTime')
		.accessor(row => row.endTime)
		.displayName('End Time')
		.icon(TimerIcon)
		// .options(getTimeOptions())
		.transformOptionFn(data => {
			const time = format(data, 'HH:mm');

			return {
				value: time,
				label: time
			};
		})
		.build(),
	dtf
		.option()
		.id('category')
		.accessor(row => row.category)
		.displayName('Category')
		.icon(ComponentIcon)
		.transformOptionFn(c => ({
			value: c.id,
			label: c.name
		}))
		.build(),
	dtf
		.option()
		.id('coordinator')
		.accessor(row => row.coordinator)
		.displayName('Coordinator')
		.icon(ShieldUserIcon)
		.transformOptionFn(c => ({
			value: c.id,
			label: c.firstName + ' ' + c.lastName
		}))
		.build(),
	dtf
		.number()
		.id('participants')
		.accessor(row => row.participants)
		.displayName('Participants')
		.icon(HashIcon)
		.build()
] as const;
