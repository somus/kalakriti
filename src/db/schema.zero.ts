import {
	type ExpressionBuilder,
	type PermissionsConfig,
	Row,
	definePermissions
} from '@rocicorp/zero';

import * as drizzleSchema from './schema';
import { type Schema, schema } from './zero-schema.gen';

export { schema, type Schema };

export type Roles = (typeof drizzleSchema.rolesEnum.enumValues)[number];

interface AuthData {
	sub: string; // assuming sub is the user identifier
	meta: {
		role?: Roles;
	};
}

// Define permissions with explicit types
export type User = Row<typeof schema.tables.users>;
export type EventCategory = Row<typeof schema.tables.eventCategories> & {
	coordinator: User;
};
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
export type ParticipantCategory = Row<
	typeof schema.tables.participantCategories
>;

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
	const allowIfLoggedIn = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, keyof Schema['tables']>
	) => eb.cmpLit(authData.sub, 'IS NOT', null);

	const loggedInUserIsAdmin = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, keyof Schema['tables']>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.cmpLit(authData.meta.role ?? '', '=', 'admin')
		);

	const loggedInUserIsGuardianOfCenter = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'centers'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.exists('guardians', q => q.where('userId', authData.sub))
		);

	const loggedInUserIsLiaisonOfCenter = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'centers'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.exists('liaisons', q => q.where('userId', authData.sub))
		);

	return {
		eventCategories: {
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
					loggedInUserIsAdmin,
					loggedInUserIsGuardianOfCenter,
					loggedInUserIsLiaisonOfCenter
				],
				insert: [loggedInUserIsAdmin],
				update: {
					preMutation: [loggedInUserIsAdmin],
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
		},
		participantCategories: {
			row: {
				select: [allowIfLoggedIn],
				insert: [loggedInUserIsAdmin],
				update: {
					preMutation: [loggedInUserIsAdmin],
					postMutation: [loggedInUserIsAdmin]
				},
				delete: [loggedInUserIsAdmin]
			}
		}
	} satisfies PermissionsConfig<AuthData, Schema>;
});
