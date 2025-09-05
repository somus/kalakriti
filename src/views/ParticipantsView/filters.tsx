import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import {
	CalendarIcon,
	CheckIcon,
	CircleSmallIcon,
	ComponentIcon,
	Heading1Icon,
	ListCheckIcon,
	SchoolIcon,
	XIcon
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
		.accessor(row => row.participantCategory?.name)
		.displayName('Participant Category')
		.icon(ComponentIcon)
		.transformOptionFn(c => ({
			value: c,
			label: c
		}))
		.build(),
	dtf
		.option()
		.id('center')
		.accessor(row => row.center?.name)
		.displayName('Center')
		.icon(SchoolIcon)
		.transformOptionFn(c => ({
			value: c,
			label: c
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
		.build(),
	dtf
		.option()
		.id('pickedUp')
		.accessor(row => (row.pickedUp ?? false).toString())
		.displayName('Had Breakfast?')
		.icon(ListCheckIcon)
		.options([
			{
				label: 'Yes',
				value: 'true',
				icon: <CheckIcon className='text-green-500' />
			},
			{
				label: 'No',
				value: 'false',
				icon: <XIcon className='text-destructive' />
			}
		])
		.build(),
	dtf
		.option()
		.id('reachedVenue')
		.accessor(row => (row.reachedVenue ?? false).toString())
		.displayName('Reached Venue?')
		.icon(ListCheckIcon)
		.options([
			{
				label: 'Yes',
				value: 'true',
				icon: <CheckIcon className='text-green-500' />
			},
			{
				label: 'No',
				value: 'false',
				icon: <XIcon className='text-destructive' />
			}
		])
		.build(),
	dtf
		.option()
		.id('leftVenue')
		.accessor(row => (row.leftVenue ?? false).toString())
		.displayName('Reached Venue?')
		.icon(ListCheckIcon)
		.options([
			{
				label: 'Yes',
				value: 'true',
				icon: <CheckIcon className='text-green-500' />
			},
			{
				label: 'No',
				value: 'false',
				icon: <XIcon className='text-destructive' />
			}
		])
		.build(),
	dtf
		.option()
		.id('droppedOff')
		.accessor(row => (row.droppedOff ?? false).toString())
		.displayName('Reached Venue?')
		.icon(ListCheckIcon)
		.options([
			{
				label: 'Yes',
				value: 'true',
				icon: <CheckIcon className='text-green-500' />
			},
			{
				label: 'No',
				value: 'false',
				icon: <XIcon className='text-destructive' />
			}
		])
		.build()
] as const;
