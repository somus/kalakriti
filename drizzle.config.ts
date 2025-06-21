import type { Config } from 'drizzle-kit';

import { env } from './api/env.server';

export default {
	schema: './shared/db/schema.ts',
	out: 'shared/db/drizzle',
	dialect: 'postgresql',
	strict: true,
	verbose: true,
	dbCredentials: {
		url: env.ZERO_UPSTREAM_DB
	}
} satisfies Config;
