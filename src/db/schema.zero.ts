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
export type EventCategory = Row<typeof schema.tables.eventCategories>;
export type Event = Row<typeof schema.tables.events>;
export type Center = Row<typeof schema.tables.centers>;
export type ParticipantCategory = Row<
	typeof schema.tables.participantCategories
>;
export type Participant = Row<typeof schema.tables.participants>;
export type EventParticipant = Row<typeof schema.tables.eventParticipants>;

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

	const loggedInUserIsGuardianOfParticipantCenter = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'participants'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.exists('center', q =>
				q.whereExists('guardians', q => q.where('userId', authData.sub))
			)
		);

	const loggedInUserIsLiaisonOfParticipantCenter = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'participants'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.exists('center', q =>
				q.whereExists('liaisons', q => q.where('userId', authData.sub))
			)
		);

	const loggedInUserIsGuardianOfEventParticipantCenter = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'eventParticipants'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.exists('participant', q =>
				q.whereExists('center', q =>
					q.whereExists('guardians', q => q.where('userId', authData.sub))
				)
			)
		);

	const loggedInUserIsLiaisonOfEventParticipantCenter = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'eventParticipants'>
	) =>
		eb.and(
			allowIfLoggedIn(authData, eb),
			eb.exists('participant', q =>
				q.whereExists('center', q =>
					q.whereExists('liaisons', q => q.where('userId', authData.sub))
				)
			)
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
		},
		participants: {
			row: {
				select: [
					loggedInUserIsAdmin,
					loggedInUserIsGuardianOfParticipantCenter,
					loggedInUserIsLiaisonOfParticipantCenter
				],
				insert: [
					loggedInUserIsAdmin,
					loggedInUserIsGuardianOfParticipantCenter,
					loggedInUserIsLiaisonOfParticipantCenter
				],
				update: {
					preMutation: [
						loggedInUserIsAdmin,
						loggedInUserIsGuardianOfParticipantCenter,
						loggedInUserIsLiaisonOfParticipantCenter
					],
					postMutation: [loggedInUserIsAdmin]
				},
				delete: [
					loggedInUserIsAdmin,
					loggedInUserIsGuardianOfParticipantCenter,
					loggedInUserIsLiaisonOfParticipantCenter
				]
			}
		},
		eventParticipants: {
			row: {
				select: [
					loggedInUserIsAdmin,
					loggedInUserIsLiaisonOfEventParticipantCenter,
					loggedInUserIsGuardianOfEventParticipantCenter
				],
				insert: [
					loggedInUserIsAdmin,
					loggedInUserIsLiaisonOfEventParticipantCenter,
					loggedInUserIsGuardianOfEventParticipantCenter
				],
				update: {
					preMutation: [
						loggedInUserIsAdmin,
						loggedInUserIsLiaisonOfEventParticipantCenter,
						loggedInUserIsGuardianOfEventParticipantCenter
					],
					postMutation: [loggedInUserIsAdmin]
				},
				delete: [
					loggedInUserIsAdmin,
					loggedInUserIsLiaisonOfEventParticipantCenter,
					loggedInUserIsGuardianOfEventParticipantCenter
				]
			}
		}
	} satisfies PermissionsConfig<AuthData, Schema>;
});
