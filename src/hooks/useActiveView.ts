import { useLocation } from 'react-router';

export const useActiveView = () => {
	const { pathname } = useLocation();
	if (pathname.startsWith('/dashboard')) {
		return '/dashboard';
	} else if (pathname.startsWith('/users')) {
		return '/users';
	} else if (pathname.startsWith('/events')) {
		return '/events';
	} else if (pathname.startsWith('/centers')) {
		return '/centers';
	} else {
		return '';
	}
};
