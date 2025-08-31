import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import {
	CheckIcon,
	CircleSmallIcon,
	ComponentIcon,
	Heading1Icon,
	ListCheckIcon,
	SchoolIcon,
	XIcon
} from 'lucide-react';

import { SubEventParticipant } from './AwardsView';

const dtf = createColumnConfigHelper<SubEventParticipant>();

export const columnsConfig = [
	dtf
		.text()
		.id('name')
		.accessor(row => row.participant?.name)
		.displayName('Name')
		.icon(Heading1Icon)
		.build(),
	dtf
		.option()
		.accessor(row =>
			((row.subRows && row.subRows?.length > 0) ?? row.groupId !== null)
				? 'group'
				: 'individual'
		)
		.id('type')
		.displayName('Type')
		.icon(CircleSmallIcon)
		.options([
			{ label: 'Group', value: 'group' },
			{ label: 'Individual', value: 'individual' }
		])
		.build(),
	dtf
		.option()
		.accessor(row => row.participant?.gender)
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
		.id('event')
		.accessor(row => row.subEvent?.event?.name)
		.displayName('Event')
		.icon(ComponentIcon)
		.transformOptionFn(c => ({
			value: c,
			label: c
		}))
		.build(),
	dtf
		.option()
		.id('participantCategory')
		.accessor(row => row.subEvent?.participantCategory?.name)
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
		.accessor(row => row.participant?.center?.name)
		.displayName('Center')
		.icon(SchoolIcon)
		.transformOptionFn(c => ({
			value: c,
			label: c
		}))
		.build(),
	dtf
		.option()
		.id('award')
		.accessor(row =>
			row.isWinner || row.subRows?.every(subRow => subRow.isWinner)
				? 'Winner'
				: 'Runner Up'
		)
		.displayName('Winner / Runner Up')
		.icon(ListCheckIcon)
		.options([
			{
				label: 'Winner',
				value: 'Winner'
			},
			{
				label: 'Runner Up',
				value: 'Runner Up'
			}
		])
		.build(),
	dtf
		.option()
		.id('prizeAwarded')
		.accessor(row => (row.prizeAwarded ?? false).toString())
		.displayName('Prize Awarded')
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
