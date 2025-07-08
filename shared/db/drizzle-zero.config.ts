import { drizzleZeroConfig } from 'drizzle-zero';

import * as drizzleSchema from './schema';

// Define your configuration file for the CLI
export default drizzleZeroConfig(drizzleSchema, {
	// Specify which tables and columns to include in the Zero schema.
	// This allows for the "expand/migrate/contract" pattern recommended in the Zero docs.
	// When a column is first added, it should be set to false, and then changed to true
	// once the migration has been run.

	// All tables/columns must be defined, but can be set to false to exclude them from the Zero schema.
	// Column names match your Drizzle schema definitions
	tables: {
		users: {
			id: true,
			firstName: true,
			lastName: true,
			role: true,
			phoneNumber: true,
			email: true,
			canLogin: true,
			createdAt: true,
			updatedAt: true
		},
		eventCategories: {
			id: true,
			name: true,
			coordinatorId: true,
			createdAt: true,
			updatedAt: true
		},
		events: {
			id: true,
			name: true,
			eventCategoryId: true,
			createdAt: true,
			updatedAt: true
		},
		eventCoordinators: {
			userId: true,
			eventId: true,
			createdAt: true,
			updatedAt: true
		},
		eventVolunteers: {
			userId: true,
			eventId: true,
			createdAt: true,
			updatedAt: true
		},
		centers: {
			id: true,
			name: true,
			phoneNumber: true,
			email: true,
			isLocked: true,
			createdAt: true,
			updatedAt: true
		},
		centerLiaisons: {
			userId: true,
			centerId: true,
			createdAt: true,
			updatedAt: true
		},
		centerGuardians: {
			userId: true,
			centerId: true,
			createdAt: true,
			updatedAt: true
		},
		participantCategories: {
			id: true,
			name: true,
			minAge: true,
			maxAge: true,
			maxBoys: true,
			maxGirls: true,
			totalEventsAllowed: true,
			maxEventsPerCategory: true,
			createdAt: true,
			updatedAt: true
		},
		participants: {
			id: true,
			name: true,
			centerId: true,
			participantCategoryId: true,
			dob: true,
			age: true,
			gender: true,
			createdAt: true,
			updatedAt: true
		},
		subEvents: {
			id: true,
			eventId: true,
			startTime: true,
			endTime: true,
			participantCategoryId: true,
			createdAt: true,
			updatedAt: true
		},
		subEventParticipants: {
			id: true,
			subEventId: true,
			participantId: true,
			attended: true,
			createdAt: true,
			updatedAt: true
		}
	}
});
