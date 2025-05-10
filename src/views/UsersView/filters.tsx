import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { User } from '@/db/schema.zero';
import { cn } from '@/lib/utils';
import {
	Heading1Icon,
	MailIcon,
	PhoneIcon,
	ShieldUserIcon
} from 'lucide-react';

import { ROLE_STYLES_MAP } from './columns';

const dtf = createColumnConfigHelper<User>();

export const columnsConfig = [
	dtf
		.text()
		.id('firstName')
		.accessor(row => row.firstName)
		.displayName('First Name')
		.icon(Heading1Icon)
		.build(),
	dtf
		.text()
		.id('lastName')
		.accessor(row => row.lastName)
		.displayName('Last Name')
		.icon(Heading1Icon)
		.build(),
	dtf
		.option()
		.accessor(row => row.role)
		.id('role')
		.displayName('Role')
		.icon(ShieldUserIcon)
		.transformOptionFn(r => ({
			value: r,
			label: r,
			icon: <div className={cn('size-2.5 rounded-full', ROLE_STYLES_MAP[r])} />
		}))
		.build(),
	dtf
		.text()
		.id('email')
		.accessor(row => row.email)
		.displayName('Email')
		.icon(MailIcon)
		.build(),
	dtf
		.text()
		.id('phoneNumber')
		.accessor(row => row.phoneNumber)
		.displayName('Phone Number')
		.icon(PhoneIcon)
		.build()
] as const;
