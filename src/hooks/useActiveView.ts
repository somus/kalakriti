import { useLocation } from 'react-router';

const paths = [
	'/users',
	'/events',
	'/centers',
	'/center/participants',
	'/center/events'
];

export const useActiveView = () => {
	const { pathname } = useLocation();
	let activePath = '';

	if (pathname === '/') return '/';

	for (const path of paths) {
		if (pathname.startsWith(path)) {
			activePath = path;
			break;
		}
	}

	return activePath;
};
