import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod';

export const env = createEnv({
	server: {
		ZERO_UPSTREAM_DB: z.url(),
		CLERK_SECRET_KEY: z.string().min(1),
		CLERK_PUBLISHABLE_KEY: z.string().min(1),
		R2_ACCOUNT_ID: z.string().min(1),
		R2_ACCESS_KEY_ID: z.string().min(1),
		R2_SECRET_KEY_ID: z.string().min(1),
		R2_BUCKET_NAME: z.string().min(1),
		ASSET_FOLDER: z.string().min(1)
	},
	runtimeEnv: {
		ZERO_UPSTREAM_DB: process.env.ZERO_UPSTREAM_DB,
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
		CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
		R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
		R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
		R2_SECRET_KEY_ID: process.env.R2_SECRET_KEY_ID,
		R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
		ASSET_FOLDER: process.env.ASSET_FOLDER
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true
});
