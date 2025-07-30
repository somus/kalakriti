import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
import kebabCase from 'lodash/kebabCase';
import postgres from 'postgres';
import { z } from 'zod';

import { env } from './env.server';

const fileSchema = z.object({
	filename: z.string().min(1),
	contentType: z.string().min(1)
});

const R2 = new S3Client({
	region: 'auto',
	endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_KEY_ID
	}
});

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
					meta: {
						role: user.publicMetadata.role as AuthData['meta']['role'],
						leading: user.publicMetadata.leading as AuthData['meta']['leading']
					}
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

app.post('/getSignedURL', async c => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return c.json({
			message: 'You are not logged in.'
		});
	}

	try {
		const body: unknown = await c.req.json();
		const { filename, contentType } = fileSchema.parse(body);

		const signedUrl = await getSignedUrl(
			R2,
			new PutObjectCommand({
				Bucket: env.R2_BUCKET_NAME,
				Key: `${env.ASSET_FOLDER}/${kebabCase(filename)}`,
				ContentType: contentType
			}),
			{ expiresIn: 3600 }
		);
		c.header('Access-Control-Allow-Origin', '*');
		return c.json({
			url: signedUrl,
			method: 'PUT'
		});
	} catch (e) {
		return Error.isError(e) ? c.json(e) : c.json({ message: e });
	}
});

app.delete('/deleteAsset', async c => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return c.json({
			message: 'You are not logged in.'
		});
	}

	try {
		const body: unknown = await c.req.json();
		const { filePath } = z
			.object({
				filePath: z.string().min(1)
			})
			.parse(body);

		const response = await R2.send(
			new DeleteObjectCommand({
				Bucket: env.R2_BUCKET_NAME,
				Key: filePath
			})
		);

		if (response.$metadata.httpStatusCode === 204) {
			return c.json({
				deleted: true,
				message: 'Asset deleted successfully'
			});
		} else {
			return c.json({
				deleted: false,
				message: 'Failed to delete asset'
			});
		}
	} catch (e) {
		return Error.isError(e) ? c.json(e) : c.json({ message: e });
	}
});

export default {
	fetch: app.fetch,
	port: 3000
};
