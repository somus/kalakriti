import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { cn } from '@/lib/utils';
import {
	CheckIcon,
	Heading1Icon,
	ListCheckIcon,
	MailIcon,
	PhoneIcon,
	ShieldUserIcon,
	XIcon
} from 'lucide-react';
import { User } from 'shared/db/schema.zero';

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
		.build(),
	dtf
		.option()
		.id('canLogin')
		.accessor(row => (row.canLogin ?? false).toString())
		.displayName('Can Login?')
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
