import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import {
	CalendarIcon,
	CircleSmallIcon,
	ComponentIcon,
	Heading1Icon,
	SchoolIcon
} from 'lucide-react';

import { Participant } from './ParticipantsView';

const dtf = createColumnConfigHelper<Participant>();

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
		.id('age')
		.accessor(row => row.age)
		.displayName('Age')
		.icon(CalendarIcon)
		.build(),
	dtf
		.option()
		.accessor(row => row.gender)
		.id('gender')
		.displayName('Gender')
		.icon(CircleSmallIcon)
		.options([
			{ label: 'Male', value: 'male' },
			{ label: 'Female', value: 'female' }
		])
		.build(),
	dtf
		.option()
		.id('participantCategory')
		.accessor(row => row.participantCategory)
		.displayName('Participant Category')
		.icon(ComponentIcon)
		.transformOptionFn(c => ({
			value: c.id,
			label: c.name
		}))
		.build(),
	dtf
		.option()
		.id('center')
		.accessor(row => row.center)
		.displayName('Center')
		.icon(SchoolIcon)
		.transformOptionFn(c => ({
			value: c.id,
			label: c.name
		}))
		.build(),
	dtf
		.multiOption()
		.id('events')
		.accessor(row => row.subEvents.map(subEvent => subEvent.subEvent))
		.displayName('Events')
		.icon(SchoolIcon)
		.transformOptionFn(subEvent => ({
			value: subEvent?.id ?? '',
			label: `${subEvent?.event?.name ?? 'Unknown Event'} - ${subEvent?.participantCategory?.name ?? 'Unknown Category'}`
		}))
		.build()
] as const;
