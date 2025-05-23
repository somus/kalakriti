import { NavMain } from '@/components/nav-main';
// import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { QrScanDialog } from '@/components/qr-scan-dialog';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from '@/components/ui/sidebar';
import { useApp } from '@/hooks/useApp';
import { useNavItems } from '@/hooks/useNavItems';
import { Command, ScanQrCode } from 'lucide-react';
import * as React from 'react';
import { Link } from 'react-router';

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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { clerkUser } = useApp();
	const navItems = useNavItems();

	const currentUser = {
		name: clerkUser.fullName ?? 'Anonymous',
		email: clerkUser.primaryEmailAddress?.emailAddress ?? 'No email',
		avatar: clerkUser.imageUrl
	};

	return (
		<Sidebar variant='inset' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size='lg' asChild>
							<Link to='/'>
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
				<NavMain items={navItems} />
				{/* <NavProjects projects={data.projects} /> */}
				{clerkUser.publicMetadata.role === 'admin' && (
					<SidebarGroup className='group-data-[collapsible=icon]:hidden mt-auto'>
						<SidebarMenu>
							<SidebarMenuItem>
								<QrScanDialog>
									<SidebarMenuButton>
										<ScanQrCode />
										<span>Scan</span>
									</SidebarMenuButton>
								</QrScanDialog>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				)}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={currentUser} />
			</SidebarFooter>
		</Sidebar>
	);
}
