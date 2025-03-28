import { GetToken } from '@clerk/types';
import {
	ClerkUser,
	ClerkUserCreateInput,
	ClerkUserUpdateInput,
	clerkUserCreateInputSchema,
	clerkUserUpdateInputSchema
} from 'shared/schema';
import { z } from 'zod';

export async function clearClerkUser({
	getToken,
	user
}: {
	getToken: GetToken;
	user: ClerkUserCreateInput;
}) {
	const token = await getToken();
	const data = clerkUserCreateInputSchema.parse(user);
	const res = await fetch('http://localhost:3000/users', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	const createdUser = (await res.json()) as ClerkUser;

	return createdUser;
}

export async function updateClerkUser({
	getToken,
	user
}: {
	getToken: GetToken;
	user: ClerkUserUpdateInput;
}) {
	const token = await getToken();
	const data = clerkUserUpdateInputSchema.parse(user);
	const res = await fetch('http://localhost:3000/users', {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	const createdUser = (await res.json()) as ClerkUser;

	return createdUser;
}

export async function deleteClerkUser({
	getToken,
	userId
}: {
	getToken: GetToken;
	userId: string;
}) {
	const token = await getToken();
	const data = z.string().parse(userId);
	const res = await fetch('http://localhost:3000/users', {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ id: data })
	});

	const createdUser = (await res.json()) as ClerkUserUpdateInput;

	return createdUser;
}
