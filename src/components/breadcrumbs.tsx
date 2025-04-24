import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Fragment, ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import { NavItem } from './nav-main';

export default function Breadcrumbs({ navItems }: { navItems: NavItem[] }) {
	const navItemsMap = navItems.reduce(
		(acc, item) => {
			acc[item.url] = item.title;
			if (item.items) {
				item.items.forEach(subItem => {
					acc[subItem.url] = subItem.title;
				});
			}
			return acc;
		},
		{} as Record<string, string>
	);
	const { pathname } = useLocation();
	const pathnames = pathname.split('/').slice(1);
	const breadcrumbItems: ReactNode[] = [];

	if (pathname !== '/') {
		pathnames.every((_path, index) => {
			const currentPath = `/${pathnames.slice(0, index + 1).join('/')}`;
			if (!navItemsMap[currentPath]) {
				return false;
			}
			const isLast = index === pathnames.length - 1;

			breadcrumbItems.push(
				<Fragment key={currentPath}>
					<BreadcrumbSeparator className='hidden md:block' />
					<BreadcrumbItem>
						{isLast ? (
							<BreadcrumbPage>{navItemsMap[currentPath]}</BreadcrumbPage>
						) : (
							<BreadcrumbLink asChild>
								<Link to={currentPath}>{navItemsMap[currentPath]}</Link>
							</BreadcrumbLink>
						)}
					</BreadcrumbItem>
				</Fragment>
			);

			return true;
		});
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem className='hidden md:block'>
					<BreadcrumbLink asChild>
						<Link to='/'>Dashboard</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				{...breadcrumbItems}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
