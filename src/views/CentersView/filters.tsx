import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';
import { Center } from '@/layout/CenterLayout';
import {
	Heading1Icon,
	MailIcon,
	PhoneIcon,
	ShieldUserIcon
} from 'lucide-react';

const dtf = createColumnConfigHelper<Center>();

export const columnsConfig = [
	dtf
		.text()
		.id('name')
		.accessor(row => row.name)
		.displayName('Name')
		.icon(Heading1Icon)
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
		.multiOption()
		.accessor(row => row.liaisons)
		.id('liaisons')
		.displayName('Liaisons')
		.icon(ShieldUserIcon)
		.transformOptionFn(data => {
			const liaison = data as unknown as Center['liaisons'][number];
			return {
				value: liaison.userId,
				label: liaison.user?.firstName + ' ' + liaison.user?.lastName
			};
		})
		.build(),
	dtf
		.multiOption()
		.accessor(row => row.guardians)
		.id('guardians')
		.displayName('Guardians')
		.icon(ShieldUserIcon)
		.transformOptionFn(data => {
			const guardian = data as unknown as Center['guardians'][number];
			return {
				value: guardian.userId,
				label: guardian.user?.firstName + ' ' + guardian.user?.lastName
			};
		})
		.build()
] as const;
