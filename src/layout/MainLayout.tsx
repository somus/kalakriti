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
import { schema } from '@/db/schema.zero.ts';
// import { UsersPage } from "@/components/zero-data";
import LoadingScreen from '@/views/general/LoadingScreen';
import { RedirectToSignIn, useAuth, useUser } from '@clerk/clerk-react';
import { Zero } from '@rocicorp/zero';
import { ZeroProvider } from '@rocicorp/zero/react';
import { memo } from 'react';
import { Outlet } from 'react-router';

const PUBLIC_SERVER = import.meta.env.VITE_PUBLIC_SERVER as string | undefined;

if (!PUBLIC_SERVER) {
	throw new Error('Missing Public Server');
}

export const MainLayout = memo(function MainLayout() {
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
		kvStore: 'idb'
	});

	return (
		<>
			<ZeroProvider zero={z}>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<header className='flex h-16 shrink-0 items-center gap-2'>
							<div className='flex items-center gap-2 px-4'>
								<SidebarTrigger className='-ml-1' />
								<Separator orientation='vertical' className='mr-2 h-4' />
								<Breadcrumbs />
							</div>
						</header>
						<Outlet />
					</SidebarInset>
				</SidebarProvider>
			</ZeroProvider>
			<Toaster />
			<PWABadge />
		</>
	);
});
