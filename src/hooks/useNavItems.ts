import { NavItem } from '@/components/nav-main';
import { useApp } from '@/hooks/useApp';
import useZero, { Zero } from '@/hooks/useZero';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import {
	CookieIcon,
	HomeIcon,
	PackageIcon,
	SchoolIcon,
	TicketsIcon,
	TrophyIcon,
	UsersIcon
} from 'lucide-react';
import { Center } from 'shared/db/schema.zero';

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
			...events
				.flatMap(event =>
					event.subEvents.map(subEvent => ({
						title: `${event.name} - ${subEvent.participantCategory?.name}`,
						url: `/events/${subEvent.id}`,
						isHidden: true
					}))
				)
				.sort((a, b) => a.title.localeCompare(b.title))
		]
	},
	{
		title: 'Centers',
		url: '/centers',
		icon: SchoolIcon,
		items: centers
			.map(center => ({
				title: center.name,
				url: `/centers/${center.id}`,
				icon: SchoolIcon
			}))
			.sort((a, b) => a.title.localeCompare(b.title))
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
		title: 'Inventory',
		url: '/inventory',
		icon: PackageIcon,
		items: [
			{
				title: 'Transactions',
				url: '/inventory/transactions'
			}
		]
	},
	{
		title: 'Awards',
		url: '/awards',
		icon: TrophyIcon
	},
	{
		title: 'Food',
		url: '/food',
		icon: CookieIcon
	}
	// {
	// 	title: 'Settings',
	// 	url: '/settings',
	// 	icon: Settings2,
	// 	items: [] as { title: string; url: string }[]
	// }
];

const getGuardianAndLiasonNavItems = (
	centers: Center[],
	events: Event[]
): NavItem[] =>
	centers.length === 1
		? [
				homeNavItem,
				{
					title: 'Participants',
					url: `/centers/${centers[0].id}/participants`,
					icon: UsersIcon
				},
				{
					title: 'Events',
					url: `/centers/${centers[0].id}/events`,
					icon: TicketsIcon,
					items: events
						.flatMap(event =>
							event.subEvents.map(subEvent => ({
								title: `${event.name} - ${subEvent.participantCategory?.name}`,
								url: `/centers/${centers[0].id}/events/${subEvent.id}`
							}))
						)
						.sort((a, b) => a.title.localeCompare(b.title))
				}
			]
		: [
				homeNavItem,
				...centers
					.flatMap(center => [
						{
							title: center.name,
							url: `/centers/${center.id}`,
							icon: UsersIcon,
							items: [
								{
									title: 'Participants',
									url: `/centers/${center.id}/participants`
								},
								{
									title: 'Events',
									url: `/centers/${center.id}/events`
								}
							]
						}
					])
					.sort((a, b) => a.title.localeCompare(b.title))
			];

const getEventVolunteerNavItems = (events: Event[]): NavItem[] => [
	homeNavItem,
	...events
		.flatMap(event =>
			event.subEvents.map(subEvent => ({
				title: `${event.name} - ${subEvent.participantCategory?.name}`,
				url: `/events/${subEvent.id}`,
				icon: TicketsIcon
			}))
		)
		.sort((a, b) => a.title.localeCompare(b.title))
];

const getLogisticsCoordinatorNavItems = (): NavItem[] => [
	homeNavItem,
	{
		title: 'Inventory',
		url: '/inventory',
		icon: PackageIcon,
		items: [
			{
				title: 'Transactions',
				url: '/inventory/transactions'
			}
		]
	}
];

function eventsQuery(z: Zero) {
	return z.query.events.related('subEvents', q =>
		q.related('participantCategory')
	);
}

export type Event = NonNullable<Row<ReturnType<typeof eventsQuery>>>;

export const useNavItems = () => {
	const { user } = useApp();
	const z = useZero();
	const [centers] = useQuery(z.query.centers);
	const [events] = useQuery(eventsQuery(z));

	if (!user) {
		return [];
	}

	if (user.role === 'admin') {
		return getAdminNavItems(centers, events);
	}

	if (user.role === 'volunteer' && user.leading === 'logistics') {
		return getLogisticsCoordinatorNavItems();
	}

	if (
		user.role === 'guardian' ||
		(user.role === 'volunteer' && user.liaisoningCenters?.length > 0)
	) {
		return getGuardianAndLiasonNavItems(centers, events);
	}

	if (
		user.role === 'volunteer' &&
		(user.coordinatingEvents?.length > 0 ||
			user.coordinatingEventCategories.length > 0)
	) {
		return getEventVolunteerNavItems(
			events.filter(
				event =>
					user.coordinatingEvents
						.map(event => event.eventId)
						.includes(event.id) ||
					user.coordinatingEventCategories
						.map(category => category.id)
						.includes(event.eventCategoryId)
			)
		);
	}

	return [homeNavItem];
};
