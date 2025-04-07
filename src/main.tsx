import { ClerkProvider } from '@clerk/clerk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { env } from './env.client';
import './index.css';

// Import your Publishable Key
const PUBLISHABLE_KEY = env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
	throw new Error('Missing Publishable Key');
}

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
			<App />
		</ClerkProvider>
	</StrictMode>
);
