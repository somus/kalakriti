import { createClerkClient } from '@clerk/backend';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import {
	PostgresJSConnection,
	PushProcessor,
	ZQLDatabase
} from '@rocicorp/zero/pg';
import { createMutators } from '@shared/db/mutators';
import { AuthData } from '@shared/db/schema.zero';
import { schema } from '@shared/db/zero-schema.gen';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import postgres from 'postgres';

import { env } from './env.server';

const processor = new PushProcessor(
	new ZQLDatabase(
		new PostgresJSConnection(postgres(env.ZERO_UPSTREAM_DB)),
		schema
	)
);

const app = new Hono().basePath('/api');
const clerkClient = createClerkClient({
	secretKey: env.CLERK_SECRET_KEY
});

app.use('*', cors());
app.use('*', clerkMiddleware());

app.post('/push', async c => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return c.json({
			message: 'You are not logged in.'
		});
	}

	try {
		const user = await clerkClient.users.getUser(auth.userId);

		const result = await processor.process(
			createMutators(
				{
					sub: auth.userId,
					meta: { role: user.publicMetadata.role as AuthData['meta']['role'] }
				},
				clerkClient
			),
			c.req.raw
		);
		return c.json(result);
	} catch (e) {
		return Error.isError(e) ? c.json(e) : c.json({ message: e });
	}
});

app.get('/', c => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return c.json({
			message: 'You are not logged in.'
		});
	}

	return c.json({
		message: 'You are logged in!',
		userId: auth.userId
	});
});

export default {
	fetch: app.fetch,
	port: 3000
};
