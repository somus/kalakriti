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
			email: true
		},
		eventCategories: {
			id: true,
			name: true,
			coordinatorId: true
		},
		events: {
			id: true,
			name: true,
			startTime: true,
			endTime: true,
			coordinatorId: true,
			eventCategoryId: true
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
