import { NavItem } from '@/components/nav-main';
import { Center, Roles } from '@/db/schema.zero';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import {
	HomeIcon,
	SchoolIcon,
	Settings2,
	TicketsIcon,
	UsersIcon
} from 'lucide-react';

const homeNavItem: NavItem = {
	title: 'Dashboard',
	url: '/',
	icon: HomeIcon
};

const getAdminNavItems = (centers: Center[]): NavItem[] => [
	homeNavItem,
	{
		title: 'Users',
		url: '/users',
		icon: UsersIcon
		// items: [
		// 	{
		// 		title: 'Create',
		// 		url: '/users/create'
		// 	},
		// 	{
		// 		title: 'Settings',
		// 		url: '#'
		// 	}
		// ]
	},
	{
		title: 'Events',
		url: '/events',
		icon: TicketsIcon,
		items: [
			{
				title: 'Categories',
				url: '/events/categories'
			}
		]
	},
	{
		title: 'Centers',
		url: '/centers',
		icon: SchoolIcon,
		items: centers.map(center => ({
			title: center.name,
			url: `/centers/${center.id}`,
			icon: SchoolIcon
		}))
	},
	{
		title: 'Participants',
		url: '/participants',
		icon: UsersIcon,
		items: [
			{
				title: 'Categories',
				url: '/participants/categories'
			}
		]
	},
	{
		title: 'Settings',
		url: '/settings',
		icon: Settings2,
		items: [] as { title: string; url: string }[]
	}
];

const getGuardianNavItems = (centers: Center[]): NavItem[] => [
	homeNavItem,
	...centers.flatMap(center => [
		{
			title: 'Participants',
			url: `/centers/${center.id}/participants`,
			icon: UsersIcon
		},
		{
			title: 'Events',
			url: `/centers/${center.id}/events`,
			icon: TicketsIcon
		}
	])
];

export const useNavItems = () => {
	const { user } = useApp();
	const z = useZero();
	const [centers] = useQuery(z.query.centers);

	if (!user) {
		return [];
	}

	const currentUserRole = user.publicMetadata.role as Roles;

	if (currentUserRole === 'admin') {
		return getAdminNavItems(centers);
	}

	if (currentUserRole === 'guardian') {
		return getGuardianNavItems(centers);
	}

	return [homeNavItem];
};
