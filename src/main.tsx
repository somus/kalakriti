import { ClerkProvider } from '@clerk/clerk-react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import { env } from './env.client';
import './index.css';

// Import your Publishable Key
const PUBLISHABLE_KEY = env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
	throw new Error('Missing Publishable Key');
}

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ClerkProvider
			publishableKey={PUBLISHABLE_KEY}
			afterSignOutUrl='/'
			appearance={{
				variables: {
					colorPrimary: 'hsl(217.19 91% 59%)'
				}
			}}
		>
			{/* eslint-disable-next-line react/no-unknown-property */}
			<div vaul-drawer-wrapper='' className='bg-background'>
				<NuqsAdapter>
					<App />
				</NuqsAdapter>
			</div>
		</ClerkProvider>
	</StrictMode>
);
