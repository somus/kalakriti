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
import { EventRow } from './EventsView';

const dtf = createColumnConfigHelper<EventRow>();

export const columnsConfig = [
	dtf
		.text()
		.id('name')
		.accessor(
			row => `${row.event.name} - ${row.subEvent.participantCategory?.name}`
		)
		.displayName('Name')
		.icon(Heading1Icon)
		.build(),
	dtf
		.option()
		.id('startTime')
		.accessor(row => row.subEvent.startTime)
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
		.accessor(row => row.subEvent.endTime)
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
		.accessor(row => row.event.category?.name)
		.displayName('Category')
		.icon(ComponentIcon)
		.transformOptionFn(c => ({
			value: c,
			label: c
		}))
		.build(),
	dtf
		.option()
		.id('participantCategory')
		.accessor(row => row.subEvent.participantCategory?.name)
		.displayName('Participant Category')
		.icon(ComponentIcon)
		.transformOptionFn(c => ({
			value: c,
			label: c
		}))
		.build(),
	dtf
		.option()
		.id('coordinator')
		.accessor(row => row.event.coordinator)
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
		.accessor(row => row.subEvent.participants)
		.displayName('Participants')
		.icon(HashIcon)
		.build()
] as const;
