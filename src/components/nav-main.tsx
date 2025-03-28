'use client';

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { useActiveView } from '@/hooks/useActiveView';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router';

export function NavMain({
	items
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const activeView = useActiveView();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map(item => (
					<Collapsible
						key={item.title}
						asChild
						defaultOpen={activeView === item.url}
					>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								isActive={activeView === item.url}
							>
								<NavLink to={item.url}>
									<item.icon />
									<span>{item.title}</span>
								</NavLink>
							</SidebarMenuButton>
							{item.items?.length ? (
								<>
									<CollapsibleTrigger asChild>
										<SidebarMenuAction className='data-[state=open]:rotate-90'>
											<ChevronRight />
											<span className='sr-only'>Toggle</span>
										</SidebarMenuAction>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map(subItem => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild>
														<NavLink to={subItem.url}>
															<span>{subItem.title}</span>
														</NavLink>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</>
							) : null}
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
