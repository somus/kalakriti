// mutators.ts
import { ClerkClient, User } from '@clerk/backend';
import { createId } from '@paralleldrive/cuid2';
import { CustomMutatorDefs, UpdateValue } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateUserArgs {
	firstName: string;
	lastName?: string;
	email: string;
	password: string;
	role: 'admin' | 'volunteer' | 'guardian';
}

export function createUserMutators(
	authData: AuthData | undefined,
	clerkClient?: ClerkClient
) {
	return {
		create: async (tx, { password, ...data }: CreateUserArgs) => {
			assertIsAdmin(authData);
			if (tx.location === 'client') {
				await tx.mutate.users.insert({ id: createId(), ...data });
			} else {
				if (!clerkClient) {
					throw new Error('Clerk client is required');
				}
				let clerkUser: User | undefined;
				try {
					clerkUser = await clerkClient.users.createUser({
						firstName: data.firstName,
						lastName: data.lastName,
						emailAddress: [data.email],
						password: password,
						skipPasswordChecks: true,
						publicMetadata: {
							role: data.role
						}
					});
					await tx.mutate.users.insert({ id: clerkUser.id, ...data });
				} catch (error) {
					console.error('Error creating user:', error);
					if (clerkUser?.id) {
						// Delete the user from Clerk if the transaction fails
						await clerkClient.users.deleteUser(clerkUser.id);
					}
					throw error;
				}
			}
		},
		update: async (
			tx,
			{
				password,
				...change
			}: UpdateValue<Schema['tables']['users']> & { password?: string }
		) => {
			assertIsAdmin(authData);
			if (tx.location === 'server') {
				if (!clerkClient) {
					throw new Error('Clerk client is required');
				}
				await clerkClient.users.updateUser(change.id, {
					firstName: change.firstName,
					lastName: change.lastName === null ? undefined : change.lastName,
					password,
					skipPasswordChecks: true,
					publicMetadata: change.role
						? {
								role: change.role
							}
						: undefined
				});
			}

			await tx.mutate.users.update(change);
		},
		delete: async (tx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			if (tx.location === 'server') {
				if (!clerkClient) {
					throw new Error('Clerk client is required');
				}
				await clerkClient.users.deleteUser(id);
			}
			await tx.mutate.users.delete({ id });
		}
	} as const satisfies CustomMutatorDefs<Schema>;
}
