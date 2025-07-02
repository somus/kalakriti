import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod/v4';

export const env = createEnv({
	server: {
		ZERO_UPSTREAM_DB: z.url(),
		CLERK_SECRET_KEY: z.string().min(1)
	},
	runtimeEnv: {
		ZERO_UPSTREAM_DB: process.env.ZERO_UPSTREAM_DB,
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true
});
