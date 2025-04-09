import { NavMain } from '@/components/nav-main';
// import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from '@/components/ui/sidebar';
import { useUser } from '@clerk/clerk-react';
import {
	BookOpen,
	Bot,
	Command,
	Settings2,
	SquareTerminal
} from 'lucide-react';
import * as React from 'react';
import { Link } from 'react-router';

export const mainNavItems = [
	{
		title: 'Users',
		url: '/users',
		icon: SquareTerminal
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
		icon: Bot
	},
	{
		title: 'Centers',
		url: '/centers',
		icon: BookOpen
	},
	{
		title: 'Settings',
		url: '/settings',
		icon: Settings2,
		items: [] as { title: string; url: string }[]
	}
];

// const data = {
// projects: [
// 	{
// 		name: 'Design Engineering',
// 		url: '#',
// 		icon: Frame
// 	},
// 	{
// 		name: 'Sales & Marketing',
// 		url: '#',
// 		icon: PieChart
// 	},
// 	{
// 		name: 'Travel',
// 		url: '#',
// 		icon: Map
// 	}
// ]
// };

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useUser();
	if (!user) {
		return null;
	}

	const currentUser = {
		name: user.fullName ?? 'Anonymous',
		email: user.primaryEmailAddress?.emailAddress ?? 'No email',
		avatar: user.imageUrl
	};

	return (
		<Sidebar variant='inset' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size='lg' asChild>
							<Link to='/dashboard'>
								<div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
									<Command className='size-4' />
								</div>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>Kalakriti</span>
									<span className='truncate text-xs'>Dashboard</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={mainNavItems} />
				{/* <NavProjects projects={data.projects} /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={currentUser} />
			</SidebarFooter>
		</Sidebar>
	);
}
