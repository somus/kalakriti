import { ClerkProvider } from '@clerk/clerk-react';
import * as Sentry from '@sentry/react';
import { NuqsAdapter } from 'nuqs/adapters/react';
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

if (env.VITE_SENTRY_DSN) {
	Sentry.init({
		dsn: env.VITE_SENTRY_DSN,
		// Setting this option to true will send default PII data to Sentry.
		// For example, automatic IP address collection on events
		sendDefaultPii: true,
		integrations: [Sentry.browserTracingIntegration()],
		// Tracing
		tracesSampleRate: 1.0, //  Capture 100% of the transactions
		// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
		tracePropagationTargets: [
			'localhost',
			/^https:\/\/kalakriti\.proudindian\.ngo\/api/
		],
		// Logs
		enableLogs: true
	});
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
			{/* eslint-disable-next-line react/no-unknown-property */}
			<div vaul-drawer-wrapper='' className='bg-background'>
				<NuqsAdapter>
					<App />
				</NuqsAdapter>
			</div>
		</ClerkProvider>
	</StrictMode>
);
