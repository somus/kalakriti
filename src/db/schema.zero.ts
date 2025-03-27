import {
	type ExpressionBuilder,
	type PermissionsConfig,
	definePermissions
} from '@rocicorp/zero';
import { createZeroSchema } from 'drizzle-zero';

import * as drizzleSchema from './schema';

export type Roles = (typeof drizzleSchema.rolesEnum.enumValues)[number];

interface AuthData {
	sub: string; // assuming sub is the user identifier
	meta: {
		role?: Roles;
	};
}

const zeroSchema = createZeroSchema(drizzleSchema, {
	// Specify which tables and columns to include in the Zero schema.
	// This allows for the "expand/migrate/contract" pattern recommended in the Zero docs.
	// When a column is first added, it should be set to false, and then changed to true
	// once the migration has been run.
	tables: {
		users: {
			id: true,
			name: true,
			role: true
		},
		events: {
			id: true,
			name: true,
			coordinatorId: true
		}
	}
});

// Must export `schema`
export const schema = zeroSchema;

// Define permissions with explicit types
export type ZeroSchema = typeof zeroSchema;

export const permissions = definePermissions<AuthData, ZeroSchema>(
	schema,
	() => {
		const allowIfLoggedIn = (
			authData: AuthData,
			eb: ExpressionBuilder<ZeroSchema, keyof ZeroSchema['tables']>
		) => eb.cmpLit(authData.sub, 'IS NOT', null);

		const loggedInUserIsAdmin = (
			authData: AuthData,
			eb: ExpressionBuilder<ZeroSchema, keyof ZeroSchema['tables']>
		) =>
			eb.and(
				allowIfLoggedIn(authData, eb),
				eb.cmpLit(authData.meta.role ?? '', '=', 'admin')
			);

		return {
			events: {
				row: {
					select: [allowIfLoggedIn]
				}
			},
			users: {
				row: {
					select: [loggedInUserIsAdmin]
				}
			}
		} satisfies PermissionsConfig<AuthData, ZeroSchema>;
	}
);
