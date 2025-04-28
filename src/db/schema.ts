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
export const genderEnum = pgEnum('gender', ['male', 'female']);

export const users = pgTable('users', {
	id: varchar('id').primaryKey(),
	firstName: varchar('first_name').notNull(),
	lastName: varchar('last_name'),
	role: rolesEnum().default('volunteer'),
	phoneNumber: varchar('phone_number'),
	email: varchar('email').notNull()
});

export const usersRelations = relations(users, ({ many, one }) => ({
	coordinatingEvents: many(events),
	coordinatingEventCategories: many(eventCategories),
	liaisoningCenter: one(centerLiaisons, {
		fields: [users.id],
		references: [centerLiaisons.userId]
	}),
	guardianCenters: one(centerGuardians, {
		fields: [users.id],
		references: [centerGuardians.userId]
	})
}));

export const eventCategories = pgTable('event_categories', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	coordinatorId: varchar('coordinator_id').references(() => users.id)
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
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	coordinatorId: varchar('coordinator_id').references(() => users.id),
	eventCategoryId: varchar('event_category_id').references(
		() => eventCategories.id
	)
});

export const eventsRelations = relations(events, ({ one, many }) => ({
	coordinator: one(users, {
		fields: [events.coordinatorId],
		references: [users.id]
	}),
	category: one(eventCategories, {
		fields: [events.eventCategoryId],
		references: [eventCategories.id]
	}),
	participants: many(eventParticipants)
}));

export const centers = pgTable('centers', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	phoneNumber: varchar('phone_number'),
	email: varchar('email').notNull()
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
			.references(() => users.id),
		centerId: varchar('center_id')
			.notNull()
			.references(() => centers.id)
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
			.references(() => users.id),
		centerId: varchar('center_id')
			.notNull()
			.references(() => centers.id)
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
	maxEventsPerCategory: integer('max_events_per_category').notNull()
});

export const participantCategoryRelations = relations(
	participantCategories,
	({ many }) => ({
		participants: many(participants)
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
		.references(() => centers.id),
	participantCategoryId: varchar('participant_category_id')
		.notNull()
		.references(() => participantCategories.id)
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
		events: many(eventParticipants)
	})
);

export const eventParticipants = pgTable('event_participants', {
	id: varchar('id').primaryKey(),
	eventId: varchar('event_id')
		.notNull()
		.references(() => events.id),
	participantId: varchar('participant_id')
		.notNull()
		.references(() => participants.id),
	attended: boolean('attended').notNull().default(false)
});

export const eventParticipantsRelations = relations(
	eventParticipants,
	({ one }) => ({
		event: one(events, {
			fields: [eventParticipants.eventId],
			references: [events.id]
		}),
		participant: one(participants, {
			fields: [eventParticipants.participantId],
			references: [participants.id]
		})
	})
);
