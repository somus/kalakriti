import { Bell } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PWABadge() {
	// check for updates every hour
	const period = 60 * 60 * 1000;

	const {
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker
	} = useRegisterSW({
		onRegisteredSW(swUrl, r) {
			if (period <= 0) return;
			if (r?.active?.state === 'activated') {
				registerPeriodicSync(period, swUrl, r);
			} else if (r?.installing) {
				r.installing.addEventListener('statechange', e => {
					const sw = e.target as ServiceWorker;
					if (sw.state === 'activated') registerPeriodicSync(period, swUrl, r);
				});
			}
		}
	});

	useEffect(() => {
		if (needRefresh) {
			toast('New content available', {
				description: 'Click on reload button to update',
				icon: <Bell className='size-4' />,
				action: {
					label: 'Reload',
					onClick: () => {
						updateServiceWorker(true).catch(e => {
							console.log('Failed to update service worker', e);
						});
					}
				},
				cancel: {
					label: 'Close',
					onClick: () => {
						setNeedRefresh(false);
					}
				}
			});
		}
	}, [needRefresh, updateServiceWorker, setNeedRefresh]);

	return null;
}

export default PWABadge;

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
	period: number,
	swUrl: string,
	r: ServiceWorkerRegistration
) {
	if (period <= 0) return;

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	setInterval(async () => {
		if ('onLine' in navigator && !navigator.onLine) return;

		const resp = await fetch(swUrl, {
			cache: 'no-store',
			headers: {
				cache: 'no-store',
				'cache-control': 'no-cache'
			}
		});

		if (resp?.status === 200) await r.update();
	}, period);
}
