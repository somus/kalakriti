import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import {
	CalendarIcon,
	CheckIcon,
	CircleSmallIcon,
	Heading1Icon,
	ListCheckIcon,
	SchoolIcon,
	XIcon
} from 'lucide-react';

import { SubEventParticipant } from './CenterEventView';

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
		.number()
		.id('age')
		.accessor(row => row.participant?.age)
		.displayName('Age')
		.icon(CalendarIcon)
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
		.id('attended')
		.accessor(row => (row.attended ?? false).toString())
		.displayName('Attended')
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
