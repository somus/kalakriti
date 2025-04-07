import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		ZERO_UPSTREAM_DB: z.string().url(),
		ZERO_CVR_DB: z.string().url(),
		ZERO_CHANGE_DB: z.string().url(),
		ZERO_AUTH_JWKS_URL: z.string().url(),
		ZERO_REPLICA_FILE: z.string(),
		CLERK_PUBLISHABLE_KEY: z.string().min(1),
		CLERK_SECRET_KEY: z.string().min(1)
	},
	runtimeEnv: {
		ZERO_UPSTREAM_DB: process.env.ZERO_UPSTREAM_DB,
		ZERO_CVR_DB: process.env.ZERO_CVR_DB,
		ZERO_CHANGE_DB: process.env.ZERO_CHANGE_DB,
		ZERO_AUTH_JWKS_URL: process.env.ZERO_AUTH_JWKS_URL,
		ZERO_REPLICA_FILE: process.env.ZERO_REPLICA_FILE,
		CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true
});
