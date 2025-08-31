import { Transaction } from '@rocicorp/zero';

import { SubEventParticipant } from './mutators/subEventParticipants';
import { AuthData, Schema } from './schema.zero';

export function assertIsLoggedIn(authData: AuthData | undefined) {
	if (!authData) {
		throw new Error('Unauthorized');
	}
}

export function assertIsAdmin(authData: AuthData | undefined) {
	assertIsLoggedIn(authData);
	if (authData?.meta.role !== 'admin') {
		throw new Error('Unauthorized');
	}
}

export function assertIsAdminOrLogisticsCoordinator(
	authData: AuthData | undefined
) {
	assertIsLoggedIn(authData);
	if (
		authData?.meta.leading !== 'logistics' &&
		authData?.meta.role !== 'admin'
	) {
		throw new Error('Unauthorized');
	}
}

export function assertIsAdminOrAwardsCoordinator(
	authData: AuthData | undefined
) {
	assertIsLoggedIn(authData);
	if (authData?.meta.leading !== 'awards' && authData?.meta.role !== 'admin') {
		throw new Error('Unauthorized');
	}
}

export async function assertIsAdminOrGuardianOrLiasonOfCenter(
	tx: Transaction<Schema>,
	authData: AuthData | undefined,
	centerId: string
) {
	assertIsLoggedIn(authData);
	const isAdmin = authData?.meta.role === 'admin';
	const center = await tx.query.centers
		.related('guardians')
		.related('liaisons')
		.where('id', centerId)
		.one();
	const isGuardian = center?.guardians.some(g => g.userId === authData?.sub);
	const isLiason = center?.liaisons.some(l => l.userId === authData?.sub);
	if (!isAdmin && !isGuardian && !isLiason) {
		throw new Error('Unauthorized');
	}
}

export async function assertIsAdminOrGuardianOrLiasonOfParticipant(
	tx: Transaction<Schema>,
	authData: AuthData | undefined,
	participantId: string
) {
	assertIsLoggedIn(authData);
	const isAdmin = authData?.meta.role === 'admin';
	const participant = await tx.query.participants
		.related('center', q => q.related('guardians').related('liaisons'))
		.where('id', participantId)
		.one();
	const isGuardian = participant?.center?.guardians.some(
		g => g.userId === authData?.sub
	);
	const isLiason = participant?.center?.liaisons.some(
		l => l.userId === authData?.sub
	);
	if (!isAdmin && !isGuardian && !isLiason) {
		throw new Error('Unauthorized');
	}
}

export async function assertIsAdminOrGuardianOrLiasonOfSubEventParticipant(
	tx: Transaction<Schema>,
	authData: AuthData | undefined,
	participantId: string
) {
	assertIsLoggedIn(authData);
	const isAdmin = authData?.meta.role === 'admin';
	const participant = await tx.query.subEventParticipants
		.related('participant', q =>
			q.related('center', q => q.related('guardians').related('liaisons'))
		)
		.where('id', participantId)
		.one();
	const isGuardian = participant?.participant?.center?.guardians.some(
		g => g.userId === authData?.sub
	);
	const isLiason = participant?.participant?.center?.liaisons.some(
		l => l.userId === authData?.sub
	);
	if (!isAdmin && !isGuardian && !isLiason) {
		throw new Error('Unauthorized');
	}
}

export async function assertIsAdminOrGuardianOrLiasonOfSubEventParticipantGroup(
	tx: Transaction<Schema>,
	authData: AuthData | undefined,
	groupId: string
) {
	assertIsLoggedIn(authData);
	const isAdmin = authData?.meta.role === 'admin';
	const participant = await tx.query.subEventParticipants
		.related('participant', q =>
			q.related('center', q => q.related('guardians').related('liaisons'))
		)
		.where('groupId', groupId)
		.one();
	const isGuardian = participant?.participant?.center?.guardians.some(
		g => g.userId === authData?.sub
	);
	const isLiason = participant?.participant?.center?.liaisons.some(
		l => l.userId === authData?.sub
	);
	if (!isAdmin && !isGuardian && !isLiason) {
		throw new Error('Unauthorized');
	}
}

export async function assertIsEventCoordinatorOfSubEventParticipant(
	tx: Transaction<Schema>,
	authData: AuthData | undefined,
	participantId?: string,
	groupId?: string
) {
	assertIsLoggedIn(authData);
	const isAdmin = authData?.meta.role === 'admin';
	let participant: SubEventParticipant | undefined;

	if (participantId) {
		participant = await tx.query.subEventParticipants
			.where('id', participantId)
			.related('subEvent', q =>
				q.related('event', q => q.related('coordinators'))
			)
			.one();
	} else if (groupId) {
		participant = await tx.query.subEventParticipants
			.where('groupId', groupId)
			.related('subEvent', q =>
				q.related('event', q => q.related('coordinators'))
			)
			.one();
	}

	if (!participant) {
		throw new Error('Invalid participant or Group ID provided');
	}
	const isCoordinator = participant?.subEvent?.event?.coordinators.some(
		g => g.userId === authData?.sub
	);

	if (!isAdmin && !isCoordinator) {
		throw new Error('Unauthorized');
	}
}
