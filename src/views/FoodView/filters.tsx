import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import {
	CheckIcon,
	CircleSmallIcon,
	Heading1Icon,
	ListCheckIcon,
	SchoolIcon,
	XIcon
} from 'lucide-react';

import { Person } from './FoodView';

const dtf = createColumnConfigHelper<Person>();

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
		.accessor(row => row.role)
		.id('role')
		.displayName('Role')
		.icon(CircleSmallIcon)
		.options([
			{ label: 'Volunteer', value: 'volunteer' },
			{ label: 'Participant', value: 'participant' },
			{ label: 'Guest', value: 'guest' },
			{ label: 'Judge', value: 'judge' },
			{ label: 'Guardian', value: 'guardian' }
		])
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
		.option()
		.id('hadBreakfast')
		.accessor(row => (row.hadBreakfast ?? false).toString())
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
		.id('hadLunch')
		.accessor(row => (row.hadLunch ?? false).toString())
		.displayName('Had Lunch?')
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
