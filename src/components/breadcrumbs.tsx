import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useNavItems } from '@/hooks/useNavItems';
import { Fragment } from 'react';
import { Link, useLocation } from 'react-router';

export default function Breadcrumbs() {
	const navItems = useNavItems();
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

	const breadcrumPaths = pathnames.reduce<string[]>((acc, _path, index) => {
		const currentPath = `/${pathnames.slice(0, index + 1).join('/')}`;

		if (navItemsMap[currentPath]) {
			acc.push(currentPath);
		}
		return acc;
	}, []);

	const breadcrumbItems =
		pathname === '/'
			? []
			: breadcrumPaths.map((path, index) => {
					const isLast = index === breadcrumPaths.length - 1;

					return (
						<Fragment key={path}>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>{navItemsMap[path]}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link to={path}>{navItemsMap[path]}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</Fragment>
					);
				});

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
