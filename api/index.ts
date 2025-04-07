import { createClerkClient } from '@clerk/backend';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';

import {
	clerkUserCreateInputSchema,
	clerkUserUpdateInputSchema
} from '../shared/schema';
import { env } from './env.server';

const app = new Hono();
const clerkClient = createClerkClient({
	secretKey: env.CLERK_SECRET_KEY
});

app.use('*', cors());
app.use('*', clerkMiddleware());
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

app.get('/users', async c => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return c.json({
			message: 'You are not logged in.'
		});
	}

	const users = await clerkClient.users.getUserList();

	return c.json(users);
});

app.post('/users', async c => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return c.json({
			message: 'You are not logged in.'
		});
	}

	const body: unknown = await c.req.json();
	const data = clerkUserCreateInputSchema.parse(body);

	try {
		const user = await clerkClient.users.createUser({
			firstName: data.firstName,
			lastName: data.lastName,
			emailAddress: [data.email],
			password: data.password,
			skipPasswordChecks: true,
			publicMetadata: {
				role: data.role
			}
		});

		return c.json(user);
	} catch (e) {
		return Error.isError(e) ? c.json(e) : c.json({ message: e });
	}
});

app.put('/users', async c => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return c.json({
			message: 'You are not logged in.'
		});
	}

	const body: unknown = await c.req.json();
	const data = clerkUserUpdateInputSchema.parse(body);

	try {
		const user = await clerkClient.users.updateUser(data.id, {
			firstName: data.firstName,
			lastName: data.lastName,
			password: data.password,
			skipPasswordChecks: true,
			publicMetadata: data.role
				? {
						role: data.role
					}
				: undefined
		});

		return c.json(user);
	} catch (e) {
		return Error.isError(e) ? c.json(e) : c.json({ message: e });
	}
});

app.delete('/users', async c => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return c.json({
			message: 'You are not logged in.'
		});
	}

	const body: unknown = await c.req.json();
	const data = z.object({ id: z.string() }).parse(body);

	try {
		const user = await clerkClient.users.deleteUser(data.id);

		return c.json(user);
	} catch (e) {
		return Error.isError(e) ? c.json(e) : c.json({ message: e });
	}
});

export default {
	fetch: app.fetch,
	port: 3000
};
