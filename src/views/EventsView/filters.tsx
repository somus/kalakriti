import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { format } from 'date-fns';
import {
	CircleSmallIcon,
	ComponentIcon,
	GroupIcon,
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
		.accessor(row => row.event.allowedGender)
		.id('allowedGender')
		.displayName('Allowed Gender')
		.icon(CircleSmallIcon)
		.options([
			{ label: 'Male', value: 'male' },
			{ label: 'Female', value: 'female' },
			{ label: 'Both', value: 'both' }
		])
		.build(),
	dtf
		.multiOption()
		.accessor(row => row.event.coordinators.map(c => c.user))
		.id('coordinators')
		.displayName('Coordinators')
		.icon(ShieldUserIcon)
		.transformOptionFn(data => {
			const user =
				data as unknown as EventRow['event']['coordinators'][number]['user'];
			return {
				value: user?.id ?? '',
				label: user?.firstName + ' ' + user?.lastName
			};
		})
		.build(),
	dtf
		.multiOption()
		.accessor(row => row.event.volunteers.map(c => c.user))
		.id('volunteers')
		.displayName('Volunteers')
		.icon(ShieldUserIcon)
		.transformOptionFn(data => {
			const user =
				data as unknown as EventRow['event']['volunteers'][number]['user'];
			return {
				value: user?.id ?? '',
				label: user?.firstName + ' ' + user?.lastName
			};
		})
		.build(),
	dtf
		.number()
		.id('participants')
		.accessor(row => row.subEvent.participants)
		.displayName('Participants')
		.icon(HashIcon)
		.build(),
	dtf
		.option()
		.accessor(row => (row.event.isGroupEvent ? 'true' : 'false'))
		.id('isGroupEvent')
		.displayName('Is Group Event')
		.icon(GroupIcon)
		.options([
			{ label: 'Yes', value: 'true' },
			{ label: 'No', value: 'false' }
		])
		.build(),
	dtf
		.number()
		.id('minGroupSize')
		.accessor(row => row.event.minGroupSize)
		.displayName('Min Group Size')
		.icon(HashIcon)
		.build(),
	dtf
		.number()
		.id('maxGroupSize')
		.accessor(row => {
			console.log(row.event.maxGroupSize);
			return row.event.maxGroupSize;
		})
		.displayName('Max Group Size')
		.icon(HashIcon)
		.build(),
	dtf
		.number()
		.id('maxParticipants')
		.accessor(row => row.event.maxParticipants)
		.displayName('Max Participants')
		.icon(HashIcon)
		.build()
] as const;
