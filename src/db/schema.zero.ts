import {
	type ExpressionBuilder,
	type PermissionsConfig,
	Row,
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
			firstName: true,
			lastName: true,
			role: true,
			phoneNumber: true,
			email: true
		},
		events: {
			id: true,
			name: true,
			startTime: true,
			endTime: true,
			coordinatorId: true
		},
		centers: {
			id: true,
			name: true,
			phoneNumber: true,
			email: true
		},
		centerLiaisons: {
			userId: true,
			centerId: true
		},
		centerGuardians: {
			userId: true,
			centerId: true
		}
	}
});

// Must export `schema`
export const schema = zeroSchema;

// Define permissions with explicit types
export type ZeroSchema = typeof zeroSchema;
export type User = Row<typeof schema.tables.users>;
export type Event = Row<typeof schema.tables.events>;
export type CenterLiaison = Row<typeof schema.tables.centerLiaisons> & {
	user: User;
};
export type CenterGuardian = Row<typeof schema.tables.centerGuardians> & {
	user: User;
};
export type Center = Row<typeof schema.tables.centers> & {
	liaisons: CenterLiaison[];
	guardians: CenterGuardian[];
};

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

		// const loggedInUserIsGuardianOfCenter = (
		// 	authData: AuthData,
		// 	eb: ExpressionBuilder<ZeroSchema, 'centers'>
		// ) =>
		// 	eb.and(allowIfLoggedIn(authData, eb), eb.cmp('guardianId', authData.sub));

		// const loggedInUserIsLiaisonOfCenter = (
		// 	authData: AuthData,
		// 	eb: ExpressionBuilder<ZeroSchema, 'centers'>
		// ) =>
		// 	eb.and(allowIfLoggedIn(authData, eb), eb.cmp('liaisonId', authData.sub));

		return {
			events: {
				row: {
					select: [allowIfLoggedIn],
					insert: [loggedInUserIsAdmin],
					update: {
						preMutation: [loggedInUserIsAdmin],
						postMutation: [loggedInUserIsAdmin]
					},
					delete: [loggedInUserIsAdmin]
				}
			},
			users: {
				row: {
					select: [loggedInUserIsAdmin],
					insert: [loggedInUserIsAdmin],
					update: {
						preMutation: [loggedInUserIsAdmin],
						postMutation: [loggedInUserIsAdmin]
					},
					delete: [loggedInUserIsAdmin]
				}
			},
			centers: {
				row: {
					select: [
						loggedInUserIsAdmin
						// loggedInUserIsGuardianOfCenter,
						// loggedInUserIsLiaisonOfCenter
					],
					insert: [loggedInUserIsAdmin],
					update: {
						preMutation: [
							loggedInUserIsAdmin
							// loggedInUserIsGuardianOfCenter,
							// loggedInUserIsLiaisonOfCenter
						],
						postMutation: [loggedInUserIsAdmin]
					},
					delete: [loggedInUserIsAdmin]
				}
			},
			centerLiaisons: {
				row: {
					select: [loggedInUserIsAdmin],
					insert: [loggedInUserIsAdmin],
					update: {
						preMutation: [loggedInUserIsAdmin],
						postMutation: [loggedInUserIsAdmin]
					},
					delete: [loggedInUserIsAdmin]
				}
			},
			centerGuardians: {
				row: {
					select: [loggedInUserIsAdmin],
					insert: [loggedInUserIsAdmin],
					update: {
						preMutation: [loggedInUserIsAdmin],
						postMutation: [loggedInUserIsAdmin]
					},
					delete: [loggedInUserIsAdmin]
				}
			}
		} satisfies PermissionsConfig<AuthData, ZeroSchema>;
	}
);
