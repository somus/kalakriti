import { relations } from 'drizzle-orm';
import {
	boolean,
	date,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('roles', ['guardian', 'admin', 'volunteer']);
export const teamsEnum = pgEnum('teams', [
	'overall',
	'events',
	'arts',
	'cultural',
	'liaison',
	'transport',
	'venue',
	'food',
	'logistics',
	'awards',
	'hospitality',
	'media',
	'fundraising'
]);
export const genderEnum = pgEnum('gender', ['male', 'female']);
export const allowedEventGenderEnum = pgEnum('allowed_event_gender', [
	'male',
	'female',
	'both'
]);
export const inventoryTransactionType = pgEnum('inventory_transaction_type', [
	'initial_inventory',
	'purchase',
	'adjustment',
	'event_return',
	'event_dispatch'
]);

export const users = pgTable('users', {
	id: varchar('id').primaryKey(),
	firstName: varchar('first_name').notNull(),
	lastName: varchar('last_name'),
	role: rolesEnum().default('volunteer').notNull(),
	leading: teamsEnum(),
	phoneNumber: varchar('phone_number').notNull(),
	email: varchar('email'),
	canLogin: boolean('can_login').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
	coordinatingEvents: many(eventCoordinators),
	volunteeringEvents: many(eventVolunteers),
	coordinatingEventCategories: many(eventCategories),
	liaisoningCenters: many(centerLiaisons),
	guardianCenters: many(centerGuardians)
}));

export const eventCategories = pgTable('event_categories', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	coordinatorId: varchar('coordinator_id').references(() => users.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const eventCategoriesRelations = relations(
	eventCategories,
	({ one, many }) => ({
		coordinator: one(users, {
			fields: [eventCategories.coordinatorId],
			references: [users.id]
		}),
		events: many(events)
	})
);

export const events = pgTable('events', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	eventCategoryId: varchar('event_category_id')
		.references(() => eventCategories.id, { onDelete: 'set null' })
		.notNull(),
	allowedGender: allowedEventGenderEnum('allowed_gender')
		.notNull()
		.default('both'),
	isGroupEvent: boolean('is_group_event').notNull().default(false),
	minGroupSize: integer('min_group_size'),
	maxGroupSize: integer('max_group_size'),
	maxParticipants: integer('max_participants').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const eventsRelations = relations(events, ({ one, many }) => ({
	coordinators: many(eventCoordinators),
	volunteers: many(eventVolunteers),
	category: one(eventCategories, {
		fields: [events.eventCategoryId],
		references: [eventCategories.id]
	}),
	subEvents: many(subEvents),
	inventoryTransactions: many(inventoryTransactions)
}));

export const eventCoordinators = pgTable(
	'event_coordinators',
	{
		userId: varchar('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		eventId: varchar('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	t => [primaryKey({ columns: [t.userId, t.eventId] })]
);

export const eventCoordinatorsRelations = relations(
	eventCoordinators,
	({ one }) => ({
		event: one(events, {
			fields: [eventCoordinators.eventId],
			references: [events.id]
		}),
		user: one(users, {
			fields: [eventCoordinators.userId],
			references: [users.id]
		})
	})
);

export const eventVolunteers = pgTable(
	'event_volunteers',
	{
		userId: varchar('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		eventId: varchar('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	t => [primaryKey({ columns: [t.userId, t.eventId] })]
);

export const eventVolunteersRelations = relations(
	eventVolunteers,
	({ one }) => ({
		event: one(events, {
			fields: [eventVolunteers.eventId],
			references: [events.id]
		}),
		user: one(users, {
			fields: [eventVolunteers.userId],
			references: [users.id]
		})
	})
);

export const subEvents = pgTable('sub_events', {
	id: varchar('id').primaryKey(),
	participantCategoryId: varchar('participant_category_id')
		.references(() => participantCategories.id, {
			onDelete: 'set null'
		})
		.notNull(),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	eventId: varchar('event_id')
		.references(() => events.id, {
			onDelete: 'cascade'
		})
		.notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const subEventsRelations = relations(subEvents, ({ one, many }) => ({
	participantCategory: one(participantCategories, {
		fields: [subEvents.participantCategoryId],
		references: [participantCategories.id]
	}),
	event: one(events, {
		fields: [subEvents.eventId],
		references: [events.id]
	}),
	participants: many(subEventParticipants)
}));

export const centers = pgTable('centers', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	isLocked: boolean('is_locked').notNull().default(false),
	enableEventMapping: boolean('enable_event_mapping').notNull().default(false),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const centersRelations = relations(centers, ({ many }) => ({
	liaisons: many(centerLiaisons),
	guardians: many(centerGuardians),
	participants: many(participants)
}));

export const centerLiaisons = pgTable(
	'center_liaisons',
	{
		userId: varchar('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		centerId: varchar('center_id')
			.notNull()
			.references(() => centers.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	t => [primaryKey({ columns: [t.userId, t.centerId] })]
);

export const centerLiaisonsRelations = relations(centerLiaisons, ({ one }) => ({
	center: one(centers, {
		fields: [centerLiaisons.centerId],
		references: [centers.id]
	}),
	user: one(users, {
		fields: [centerLiaisons.userId],
		references: [users.id]
	})
}));

export const centerGuardians = pgTable(
	'center_guardians',
	{
		userId: varchar('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		centerId: varchar('center_id')
			.notNull()
			.references(() => centers.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	t => [primaryKey({ columns: [t.userId, t.centerId] })]
);

export const centerGuardiansRelations = relations(
	centerGuardians,
	({ one }) => ({
		center: one(centers, {
			fields: [centerGuardians.centerId],
			references: [centers.id]
		}),
		user: one(users, {
			fields: [centerGuardians.userId],
			references: [users.id]
		})
	})
);

export const participantCategories = pgTable('participant_categories', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	minAge: integer('min_age').notNull(),
	maxAge: integer('max_age').notNull(),
	maxBoys: integer('max_boys').notNull(),
	maxGirls: integer('max_girls').notNull(),
	totalEventsAllowed: integer('total_events_allowed').notNull(),
	maxEventsPerCategory: integer('max_events_per_category').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const participantCategoryRelations = relations(
	participantCategories,
	({ many }) => ({
		participants: many(participants),
		subEvents: many(subEvents)
	})
);

export const participants = pgTable('participants', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	dob: date('dob').notNull(),
	age: integer('age').notNull(),
	gender: genderEnum().notNull(),
	centerId: varchar('center_id')
		.notNull()
		.references(() => centers.id, {
			onDelete: 'cascade'
		}),
	participantCategoryId: varchar('participant_category_id')
		.notNull()
		.references(() => participantCategories.id, {
			onDelete: 'cascade'
		}),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const participantsRelations = relations(
	participants,
	({ one, many }) => ({
		center: one(centers, {
			fields: [participants.centerId],
			references: [centers.id]
		}),
		participantCategory: one(participantCategories, {
			fields: [participants.participantCategoryId],
			references: [participantCategories.id]
		}),
		subEvents: many(subEventParticipants)
	})
);

export const subEventParticipants = pgTable('sub_event_participants', {
	id: varchar('id').primaryKey(),
	subEventId: varchar('sub_event_id')
		.notNull()
		.references(() => subEvents.id, {
			onDelete: 'cascade'
		}),
	participantId: varchar('participant_id')
		.notNull()
		.references(() => participants.id, {
			onDelete: 'cascade'
		}),
	groupId: varchar('group_id'),
	attended: boolean('attended').notNull().default(false),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const subEventParticipantsRelations = relations(
	subEventParticipants,
	({ one }) => ({
		subEvent: one(subEvents, {
			fields: [subEventParticipants.subEventId],
			references: [subEvents.id]
		}),
		participant: one(participants, {
			fields: [subEventParticipants.participantId],
			references: [participants.id]
		})
	})
);

export const inventory = pgTable('inventory', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	quantity: integer('quantity').notNull(),
	unitPrice: integer('unit_price').notNull(),
	eventId: varchar('event_id').references(() => events.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
	event: one(events, {
		fields: [inventory.eventId],
		references: [events.id]
	}),
	transactions: many(inventoryTransactions)
}));

export const inventoryTransactions = pgTable('inventory_transactions', {
	id: varchar('id').primaryKey(),
	inventoryId: varchar('inventory_id')
		.notNull()
		.references(() => inventory.id, {
			onDelete: 'cascade'
		}),
	eventId: varchar('event_id').references(() => events.id, {
		onDelete: 'set null'
	}),
	type: inventoryTransactionType().notNull(),
	quantity: integer('quantity').notNull(),
	notes: varchar('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const inventoryTransactionsRelations = relations(
	inventoryTransactions,
	({ one }) => ({
		event: one(events, {
			fields: [inventoryTransactions.eventId],
			references: [events.id]
		}),
		inventory: one(inventory, {
			fields: [inventoryTransactions.inventoryId],
			references: [inventory.id]
		})
	})
);
