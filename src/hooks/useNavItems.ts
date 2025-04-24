import { NavItem } from '@/components/nav-main';
import { Roles } from '@/db/schema.zero';
import { useUser } from '@clerk/clerk-react';
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

const adminNavItems: NavItem[] = [
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
		icon: TicketsIcon
	},
	{
		title: 'Centers',
		url: '/centers',
		icon: SchoolIcon
	},
	{
		title: 'Settings',
		url: '/settings',
		icon: Settings2,
		items: [] as { title: string; url: string }[]
	}
];

const guardianNavItems: NavItem[] = [
	homeNavItem,
	{
		title: 'Participants',
		url: '/center/participants',
		icon: UsersIcon
	},
	{
		title: 'Events',
		url: '/center/events',
		icon: TicketsIcon
	}
];

export const useNavItems = () => {
	const { user } = useUser();

	if (!user) {
		return [];
	}

	const currentUserRole = user.publicMetadata.role as Roles;

	if (currentUserRole === 'admin') {
		return adminNavItems;
	}

	if (currentUserRole === 'guardian') {
		return guardianNavItems;
	}

	return [homeNavItem];
};
