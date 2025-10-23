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

export function assertIsAdminOrFoodCoordinator(authData: AuthData | undefined) {
	assertIsLoggedIn(authData);
	if (authData?.meta.leading !== 'food' && authData?.meta.role !== 'admin') {
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

export async function assertIsAdminOrLiasonOfCenter(
	tx: Transaction<Schema>,
	authData: AuthData | undefined,
	centerId: string
) {
	assertIsLoggedIn(authData);
	const isAdmin = authData?.meta.role === 'admin';
	const isLiaisonCoordinator = authData?.meta.leading === 'liaison';
	const center = await tx.query.centers
		.related('liaisons')
		.where('id', centerId)
		.one()
		.run();
	const isLiason = center?.liaisons.some(l => l.userId === authData?.sub);
	if (!isAdmin && !isLiaisonCoordinator && !isLiason) {
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
	const isLiaisonCoordinator = authData?.meta.leading === 'liaison';
	const center = await tx.query.centers
		.related('guardians')
		.related('liaisons')
		.where('id', centerId)
		.one()
		.run();
	const isGuardian = center?.guardians.some(g => g.userId === authData?.sub);
	const isLiason = center?.liaisons.some(l => l.userId === authData?.sub);
	if (!isAdmin && !isLiaisonCoordinator && !isGuardian && !isLiason) {
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
	const isLiaisonCoordinator = authData?.meta.leading === 'liaison';
	const participant = await tx.query.participants
		.related('center', q => q.related('guardians').related('liaisons'))
		.where('id', participantId)
		.one()
		.run();
	const isGuardian = participant?.center?.guardians.some(
		g => g.userId === authData?.sub
	);
	const isLiason = participant?.center?.liaisons.some(
		l => l.userId === authData?.sub
	);
	if (!isAdmin && !isLiaisonCoordinator && !isGuardian && !isLiason) {
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
	const isLiaisonCoordinator = authData?.meta.leading === 'liaison';
	const participant = await tx.query.subEventParticipants
		.related('participant', q =>
			q.related('center', q => q.related('guardians').related('liaisons'))
		)
		.where('id', participantId)
		.one()
		.run();
	const isGuardian = participant?.participant?.center?.guardians.some(
		g => g.userId === authData?.sub
	);
	const isLiason = participant?.participant?.center?.liaisons.some(
		l => l.userId === authData?.sub
	);
	if (!isAdmin && !isLiaisonCoordinator && !isGuardian && !isLiason) {
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
	const isLiaisonCoordinator = authData?.meta.leading === 'liaison';
	const participant = await tx.query.subEventParticipants
		.related('participant', q =>
			q.related('center', q => q.related('guardians').related('liaisons'))
		)
		.where('groupId', groupId)
		.one()
		.run();
	const isGuardian = participant?.participant?.center?.guardians.some(
		g => g.userId === authData?.sub
	);
	const isLiason = participant?.participant?.center?.liaisons.some(
		l => l.userId === authData?.sub
	);
	if (!isAdmin && !isLiaisonCoordinator && !isGuardian && !isLiason) {
		throw new Error('Unauthorized');
	}
}

export async function assertIsEventCoordinatorOfSubEvent(
	tx: Transaction<Schema>,
	authData: AuthData | undefined,
	subEventId: string
) {
	assertIsLoggedIn(authData);
	const isAdmin = authData?.meta.role === 'admin';
	const subEvent = await tx.query.subEvents
		.where('id', subEventId)
		.related('event', q => q.related('coordinators').related('category'))
		.one()
		.run();

	if (!subEvent) {
		throw new Error('Invalid event ID provided');
	}
	const isCoordinator = subEvent?.event?.coordinators.some(
		g => g.userId === authData?.sub
	);
	const isEventCategoryCoordinator =
		subEvent?.event?.category?.coordinatorId === authData?.sub;

	if (!isAdmin && !isCoordinator && !isEventCategoryCoordinator) {
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
				q.related('event', q => q.related('coordinators').related('category'))
			)
			.one()
			.run();
	} else if (groupId) {
		participant = await tx.query.subEventParticipants
			.where('groupId', groupId)
			.related('subEvent', q =>
				q.related('event', q => q.related('coordinators').related('category'))
			)
			.one()
			.run();
	}

	if (!participant) {
		throw new Error('Invalid participant or Group ID provided');
	}
	const isCoordinator = participant?.subEvent?.event?.coordinators.some(
		g => g.userId === authData?.sub
	);
	const isEventCategoryCoordinator =
		participant?.subEvent?.event?.category?.coordinatorId === authData?.sub;

	if (!isAdmin && !isCoordinator && !isEventCategoryCoordinator) {
		throw new Error('Unauthorized');
	}
}
