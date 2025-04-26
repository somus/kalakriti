import { useNavItems } from '@/hooks/useNavItems';
import { useLocation } from 'react-router';

export const useActiveView = () => {
	const { pathname } = useLocation();
	const navItems = useNavItems();
	let activePath = '';

	if (pathname === '/') return '/';

	for (const navItem of navItems) {
		if (pathname.startsWith(navItem.url) && navItem.url !== '/') {
			activePath = navItem.url;
			break;
		}
	}

	return activePath;
};
