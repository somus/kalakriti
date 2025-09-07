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
const userNavItem: NavItem = {
	title: 'Users',
	url: '/users',
	icon: UsersIcon
};

const getAdminNavItems = (centers: Center[], events: Event[]): NavItem[] => [
	homeNavItem,
	userNavItem,
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
	events: Event[],
	isTransportCoordinator?: boolean
): NavItem[] => {
	const userNavItem = {
		title: isTransportCoordinator ? 'Volunteers' : 'Users',
		url: isTransportCoordinator
			? '/users?filters=[{"columnId":"role","type":"option","operator":"is","values":["volunteer"]},{"columnId":"team","type":"option","operator":"is","values":["transport"]}]'
			: '/users',
		icon: UsersIcon
	};
	return centers.length === 1
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
				},
				userNavItem
			].filter(item => item.title !== 'Events' || !isTransportCoordinator)
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
							].filter(
								item => item.title !== 'Events' || !isTransportCoordinator
							)
						}
					])
					.sort((a, b) => a.title.localeCompare(b.title)),
				userNavItem
			];
};

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
		.sort((a, b) => a.title.localeCompare(b.title)),
	userNavItem
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
	},
	{
		title: 'Volunteers',
		url: '/users?filters=[{"columnId":"role","type":"option","operator":"is","values":["volunteer"]},{"columnId":"team","type":"option","operator":"is","values":["logistics"]}]',
		icon: UsersIcon
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

	if (user.role === 'volunteer' && user.leading === 'food') {
		return [
			homeNavItem,
			{
				title: 'Volunteers',
				url: '/users?filters=[{"columnId":"role","type":"option","operator":"is","values":["volunteer"]},{"columnId":"team","type":"option","operator":"is","values":["food"]}]',
				icon: UsersIcon
			}
		];
	}

	if (user.role === 'volunteer' && user.leading === 'awards') {
		return [
			homeNavItem,
			{
				title: 'Volunteers',
				url: '/users?filters=[{"columnId":"role","type":"option","operator":"is","values":["volunteer"]},{"columnId":"team","type":"option","operator":"is","values":["awards"]}]',
				icon: UsersIcon
			}
		];
	}

	if (
		user.role === 'guardian' ||
		(user.role === 'volunteer' && user.liaisoningCenters?.length > 0) ||
		user.leading === 'liaison' ||
		user.leading === 'transport'
	) {
		return getGuardianAndLiasonNavItems(
			centers,
			events,
			user.leading === 'transport'
		);
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

	return [homeNavItem, userNavItem];
};
