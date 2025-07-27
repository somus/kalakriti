// mutators.ts
import { ClerkClient } from '@clerk/backend';
import { CustomMutatorDefs } from '@rocicorp/zero';

import { createCenterMutators } from './mutators/centers.ts';
import { createEventCategoryMutators } from './mutators/eventCategories.ts';
import { createEventMutators } from './mutators/events.ts';
import { createInventoryMutators } from './mutators/inventory.ts';
import { createParticipantCategoryMutators } from './mutators/participantCategories.ts';
import { createParticipantMutators } from './mutators/participants.ts';
import { createSubEventParticipantMutators } from './mutators/subEventParticipants.ts';
import { createSubEventMutators } from './mutators/subEvents.ts';
import { createUserMutators } from './mutators/users.ts';
import { AuthData, Schema } from './schema.zero.ts';

export interface CreateEventCategoryArgs {
	id: string;
	name: string;
	coordinatorId?: string | null;
}

export function createMutators(
	authData: AuthData | undefined,
	clerkClient?: ClerkClient
) {
	return {
		users: createUserMutators(authData, clerkClient),
		eventCategories: createEventCategoryMutators(authData),
		events: createEventMutators(authData),
		subEvents: createSubEventMutators(authData),
		centers: createCenterMutators(authData),
		participantCategories: createParticipantCategoryMutators(authData),
		participants: createParticipantMutators(authData),
		subEventParticipants: createSubEventParticipantMutators(authData),
		inventory: createInventoryMutators(authData)
	} as const satisfies CustomMutatorDefs<Schema>;
}
