import { ClerkAPIError, GetToken } from '@clerk/types';
import {
	ClerkUser,
	ClerkUserCreateInput,
	ClerkUserUpdateInput,
	clerkUserCreateInputSchema,
	clerkUserUpdateInputSchema
} from 'shared/schema';
import * as z from 'zod/v4';

interface ClerkError {
	clerkError: boolean;
	clerkTraceId: string;
	status: number;
	errors: ClerkAPIError[];
}

export type ClerkResult = ClerkUser | ClerkError;

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

	const createdUser = (await res.json()) as ClerkResult;

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

	const updatedUser = (await res.json()) as ClerkResult;

	return updatedUser;
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

	const deletedUser = (await res.json()) as ClerkResult;

	return deletedUser;
}
