import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { HashIcon, Heading1Icon } from 'lucide-react';
import { ParticipantCategory } from 'shared/db/schema.zero';

const dtf = createColumnConfigHelper<ParticipantCategory>();

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
		.id('minAge')
		.accessor(row => row.minAge)
		.displayName('Min Age')
		.icon(HashIcon)
		.max(30)
		.build(),
	dtf
		.number()
		.id('maxAge')
		.accessor(row => row.maxAge)
		.displayName('Max Age')
		.icon(HashIcon)
		.max(30)
		.build(),
	dtf
		.number()
		.id('maxBoys')
		.accessor(row => row.maxBoys)
		.displayName('Max Boys Count')
		.icon(HashIcon)
		.max(50)
		.build(),
	dtf
		.number()
		.id('maxGirls')
		.accessor(row => row.maxGirls)
		.displayName('Max Girls Count')
		.icon(HashIcon)
		.max(50)
		.build(),
	dtf
		.number()
		.id('totalEventsAllowed')
		.accessor(row => row.totalEventsAllowed)
		.displayName('Total Events Allowed')
		.icon(HashIcon)
		.max(10)
		.build(),
	dtf
		.number()
		.id('maxEventsPerCategory')
		.accessor(row => row.maxEventsPerCategory)
		.displayName('Max Events Per Category')
		.icon(HashIcon)
		.max(10)
		.build()
] as const;
