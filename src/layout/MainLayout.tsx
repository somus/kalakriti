import PWABadge from '@/PWABadge';
import { AppSidebar } from '@/components/app-sidebar';
import Breadcrumbs from '@/components/breadcrumbs';
import { Separator } from '@/components/ui/separator';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/hooks/useApp';
import LoadingScreen from '@/views/general/LoadingScreen';
import { RedirectToSignIn, useAuth, useUser } from '@clerk/clerk-react';
import { Zero } from '@rocicorp/zero';
import { ZeroProvider } from '@rocicorp/zero/react';
import { Outlet } from 'react-router';
import { createMutators } from 'shared/db/mutators';
import { AuthData, schema } from 'shared/db/schema.zero';

import { env } from '../env.client';

const PUBLIC_SERVER = env.VITE_PUBLIC_SERVER;

if (!PUBLIC_SERVER) {
	throw new Error('Missing Public Server');
}

export default function MainLayout() {
	const { isLoaded: isUserLoaded, user } = useUser();
	const { getToken } = useAuth();

	// If not loaded, show loading screen
	if (!isUserLoaded) {
		return <LoadingScreen />;
	}

	// If no user, redirect to sign in
	if (!user) {
		return <RedirectToSignIn />;
	}

	const z = new Zero({
		userID: user.id,
		auth: async () => {
			const token = await getToken({ template: 'zero-jwt' });

			if (!token) {
				throw new Error('No token');
			}

			return token;
		},
		server: PUBLIC_SERVER,
		schema,
		kvStore: 'idb',
		mutators: createMutators({
			sub: user.id,
			meta: { role: user.publicMetadata.role as AuthData['meta']['role'] }
		})
	});

	return (
		<>
			<ZeroProvider zero={z}>
				<AppProvider context={{ clerkUser: user }}>
					<SidebarProvider>
						<AppSidebar />
						<SidebarInset>
							<header className='flex h-16 shrink-0 items-center gap-2 border-b'>
								<div className='flex justify-between gap-2 flex-1'>
									<div className='flex items-center gap-2 px-4'>
										<SidebarTrigger className='-ml-1' />
										<Separator orientation='vertical' className='mr-2 h-4' />
										<Breadcrumbs />
									</div>
									<img
										src='/proud-indian-logo.png'
										alt='Proud Indian Logo'
										className='h-8 pr-4'
									/>
								</div>
							</header>
							<Outlet />
						</SidebarInset>
					</SidebarProvider>
				</AppProvider>
			</ZeroProvider>
			<Toaster position='bottom-right' richColors />
			<PWABadge />
		</>
	);
}
