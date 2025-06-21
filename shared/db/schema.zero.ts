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

export interface AuthData {
	sub: string; // assuming sub is the user identifier
	meta: {
		role?: Roles;
	};
}

// Define permissions with explicit types
export type User = Row<typeof schema.tables.users>;
export type EventCategory = Row<typeof schema.tables.eventCategories>;
export type Event = Row<typeof schema.tables.events>;
export type SubEvent = Row<typeof schema.tables.subEvents>;
export type Center = Row<typeof schema.tables.centers>;
export type ParticipantCategory = Row<
	typeof schema.tables.participantCategories
>;
export type Participant = Row<typeof schema.tables.participants>;
export type EventParticipant = Row<typeof schema.tables.subEventParticipants>;

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

	const centerPermission = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'centers'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.or(
				eb.exists('guardians', q => q.where('userId', authData.sub)),
				eb.exists('liaisons', q => q.where('userId', authData.sub))
			)
		);

	const participantPermission = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'participants'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.or(
				eb.exists('center', q =>
					q.whereExists('guardians', q => q.where('userId', authData.sub))
				),
				eb.exists('center', q =>
					q.whereExists('liaisons', q => q.where('userId', authData.sub))
				)
			)
		);

	const eventParticipantPermission = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'subEventParticipants'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.or(
				eb.exists('participant', q =>
					q.whereExists('center', q =>
						q.whereExists('guardians', q => q.where('userId', authData.sub))
					)
				),
				eb.exists('participant', q =>
					q.whereExists('center', q =>
						q.whereExists('liaisons', q => q.where('userId', authData.sub))
					)
				)
			)
		);

	const centerLiasonPermission = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'centerLiaisons'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.or(
				eb.exists('center', q =>
					q.whereExists('guardians', q => q.where('userId', authData.sub))
				),
				eb.exists('center', q =>
					q.whereExists('liaisons', q => q.where('userId', authData.sub))
				)
			)
		);

	const centerGuardianPermission = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'centerGuardians'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.or(
				eb.exists('center', q =>
					q.whereExists('guardians', q => q.where('userId', authData.sub))
				),
				eb.exists('center', q =>
					q.whereExists('liaisons', q => q.where('userId', authData.sub))
				)
			)
		);

	const userReadPermission = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'users'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.or(
				eb.cmp('id', '=', authData.sub),
				eb.exists('liaisoningCenter', q =>
					q.whereExists('center', q =>
						q.whereExists('guardians', q => q.where('userId', authData.sub))
					)
				),
				eb.exists('guardianCenters', q =>
					q.whereExists('center', q =>
						q.whereExists('guardians', q => q.where('userId', authData.sub))
					)
				),
				eb.exists('liaisoningCenter', q =>
					q.whereExists('center', q =>
						q.whereExists('liaisons', q => q.where('userId', authData.sub))
					)
				),
				eb.exists('guardianCenters', q =>
					q.whereExists('center', q =>
						q.whereExists('liaisons', q => q.where('userId', authData.sub))
					)
				)
			)
		);

	return {
		eventCategories: {
			row: {
				select: [allowIfLoggedIn]
			}
		},
		events: {
			row: {
				select: [allowIfLoggedIn]
			}
		},
		subEvents: {
			row: {
				select: [allowIfLoggedIn]
			}
		},
		users: {
			row: {
				select: [loggedInUserIsAdmin, userReadPermission]
			}
		},
		centers: {
			row: {
				select: [loggedInUserIsAdmin, centerPermission]
			}
		},
		centerLiaisons: {
			row: {
				select: [loggedInUserIsAdmin, centerLiasonPermission]
			}
		},
		centerGuardians: {
			row: {
				select: [loggedInUserIsAdmin, centerGuardianPermission]
			}
		},
		participantCategories: {
			row: {
				select: [allowIfLoggedIn]
			}
		},
		participants: {
			row: {
				select: [loggedInUserIsAdmin, participantPermission]
			}
		},
		subEventParticipants: {
			row: {
				select: [loggedInUserIsAdmin, eventParticipantPermission]
			}
		}
	} satisfies PermissionsConfig<AuthData, Schema>;
});
