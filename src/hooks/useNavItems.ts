import { NavItem } from '@/components/nav-main';
import { Center, Event } from '@/db/schema.zero';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import { HomeIcon, SchoolIcon, TicketsIcon, UsersIcon } from 'lucide-react';

const homeNavItem: NavItem = {
	title: 'Dashboard',
	url: '/',
	icon: HomeIcon
};

const getAdminNavItems = (centers: Center[], events: Event[]): NavItem[] => [
	homeNavItem,
	{
		title: 'Users',
		url: '/users',
		icon: UsersIcon
	},
	{
		title: 'Events',
		url: '/events',
		icon: TicketsIcon,
		items: [
			{
				title: 'Categories',
				url: '/events/categories'
			},
			...events.map(event => ({
				title: event.name,
				url: `/events/${event.id}`,
				isHidden: true
			}))
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
	}
	// {
	// 	title: 'Settings',
	// 	url: '/settings',
	// 	icon: Settings2,
	// 	items: [] as { title: string; url: string }[]
	// }
];

const getGuardianNavItems = (centers: Center[], events: Event[]): NavItem[] => [
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
			icon: TicketsIcon,
			items: events.map(event => ({
				title: event.name,
				url: `/centers/${center.id}/events/${event.id}`
			}))
		}
	])
];

export const useNavItems = () => {
	const { user } = useApp();
	const z = useZero();
	const [centers] = useQuery(z.query.centers);
	const [events] = useQuery(z.query.events);

	if (!user) {
		return [];
	}

	if (user.role === 'admin') {
		return getAdminNavItems(centers, events);
	}

	if (user.role === 'guardian') {
		return getGuardianNavItems(centers, events);
	}

	return [homeNavItem];
};
