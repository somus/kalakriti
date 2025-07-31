import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod';

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_PUBLIC_SERVER: z.url(),
		VITE_IMAGE_CDN: z.string().min(1),
		VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
		VITE_ASSET_FOLDER: z.string().min(1),
		VITE_API_SERVER: z.url()
	},
	runtimeEnv: {
		VITE_PUBLIC_SERVER: (import.meta.env.VITE_PUBLIC_SERVER ??
			process.env.VITE_PUBLIC_SERVER) as string,
		VITE_IMAGE_CDN: (import.meta.env.VITE_IMAGE_CDN ??
			process.env.VITE_IMAGE_CDN) as string,
		VITE_CLERK_PUBLISHABLE_KEY: (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
			process.env.VITE_CLERK_PUBLISHABLE_KEY) as string,
		VITE_ASSET_FOLDER: (import.meta.env.VITE_ASSET_FOLDER ??
			process.env.VITE_ASSET_FOLDER) as string,
		VITE_API_SERVER: (import.meta.env.VITE_API_SERVER ??
			process.env.VITE_API_SERVER) as string
	},
	skipValidation: !!import.meta.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true
});
