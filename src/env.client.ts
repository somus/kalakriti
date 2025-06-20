import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod/v4';

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_PUBLIC_SERVER: z.url(),
		VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1)
	},
	runtimeEnv: {
		VITE_PUBLIC_SERVER: import.meta.env.VITE_PUBLIC_SERVER as string,
		VITE_CLERK_PUBLISHABLE_KEY: import.meta.env
			.VITE_CLERK_PUBLISHABLE_KEY as string
	},
	skipValidation: !!import.meta.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true
});
