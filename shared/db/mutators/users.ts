// mutators.ts
import { ClerkClient, User } from '@clerk/backend';
import { ClerkAPIResponseError } from '@clerk/types';
import { createId } from '@paralleldrive/cuid2';
import { Transaction, UpdateValue } from '@rocicorp/zero';
import isObject from 'lodash/isObject';

import {
	assertIsAdmin,
	assertIsAdminOrFoodCoordinator
} from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateUserArgs {
	id?: string;
	firstName: string;
	lastName?: string;
	email?: string;
	phoneNumber: string;
	password?: string;
	role: 'admin' | 'volunteer' | 'guardian' | 'guest' | 'judge';
	leading?:
		| 'overall'
		| 'events'
		| 'arts'
		| 'cultural'
		| 'liaison'
		| 'transport'
		| 'venue'
		| 'food'
		| 'logistics'
		| 'awards'
		| 'hospitality'
		| 'media'
		| 'fundraising';
	team?:
		| 'overall'
		| 'events'
		| 'arts'
		| 'cultural'
		| 'liaison'
		| 'transport'
		| 'venue'
		| 'food'
		| 'logistics'
		| 'awards'
		| 'hospitality'
		| 'media'
		| 'fundraising';
	canLogin: boolean;
}

type MutatorTx = Transaction<Schema>;

export function createUserMutators(
	authData: AuthData | undefined,
	clerkClient?: ClerkClient
) {
	return {
		create: async (tx: MutatorTx, { password, ...data }: CreateUserArgs) => {
			assertIsAdmin(authData);

			if (data.canLogin && !password) {
				throw new Error('Password is required for login-enabled users');
			}

			if (tx.location === 'client' || !data.canLogin) {
				await tx.mutate.users.insert({ ...data, id: data.id ?? createId() });
			} else {
				if (!clerkClient) {
					throw new Error('Clerk client is required');
				}
				if (!data.email) {
					throw new Error('Email is required for login-enabled users');
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
							role: data.role,
							leading: data.leading,
							team: data.team
						}
					});
					await tx.mutate.users.insert({ id: clerkUser.id, ...data });
				} catch (error) {
					console.error('Error creating user:', error);

					if (isClerkError(error)) {
						throw new Error(
							`Error creating user: ${error.errors[0].longMessage}`
						);
					}

					if (clerkUser?.id) {
						// Delete the user from Clerk if the transaction fails
						await clerkClient.users.deleteUser(clerkUser.id);
					}
					throw error;
				}
			}
		},
		update: async (
			tx: MutatorTx,
			change: UpdateValue<Schema['tables']['users']>
		) => {
			assertIsAdmin(authData);

			const user = await tx.query.users.where('id', change.id).one().run();
			if (!user) {
				throw new Error('User not found');
			}

			if (tx.location === 'server' && user.canLogin) {
				if (!clerkClient) {
					throw new Error('Clerk client is required');
				}
				await clerkClient.users.updateUser(change.id, {
					firstName: change.firstName,
					lastName: change.lastName === null ? undefined : change.lastName,
					publicMetadata: change.role
						? {
								role: change.role,
								leading: change.leading,
								team: change.team
							}
						: undefined
				});
			}

			await tx.mutate.users.update({
				...change,
				updatedAt: new Date().getTime()
			});
		},
		toggleHadBreakfast: async (tx: MutatorTx, id: string) => {
			assertIsAdminOrFoodCoordinator(authData);

			const user = await tx.query.users.where('id', id).one().run();
			if (!user) {
				throw new Error('User not found');
			}

			await tx.mutate.users.update({
				id,
				hadBreakfast: !user.hadBreakfast,
				updatedAt: new Date().getTime()
			});
		},
		toggleHadLunch: async (tx: MutatorTx, id: string) => {
			assertIsAdminOrFoodCoordinator(authData);

			const user = await tx.query.users.where('id', id).one().run();
			if (!user) {
				throw new Error('User not found');
			}

			await tx.mutate.users.update({
				id,
				hadLunch: !user.hadLunch,
				updatedAt: new Date().getTime()
			});
		},
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			assertIsAdmin(authData);

			const user = await tx.query.users.where('id', id).one().run();
			if (!user) {
				throw new Error('User not found');
			}

			if (tx.location === 'server' && user.canLogin) {
				if (!clerkClient) {
					throw new Error('Clerk client is required');
				}
				await clerkClient.users.deleteUser(id);
			}
			await tx.mutate.users.delete({ id });
		}
	} as const;
}

const isClerkError = (error: unknown): error is ClerkAPIResponseError => {
	if (isObject(error) && 'clerkError' in error && error.clerkError) {
		return true;
	}
	return false;
};
