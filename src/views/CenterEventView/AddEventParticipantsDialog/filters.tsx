import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { Participant } from '@/db/schema.zero';
import { CalendarIcon, CircleSmallIcon, Heading1Icon } from 'lucide-react';

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
		.build()
] as const;
