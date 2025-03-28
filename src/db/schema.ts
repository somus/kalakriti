import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('roles', ['guardian', 'admin', 'volunteer']);

export const users = pgTable('users', {
	id: varchar('id').primaryKey(),
	firstName: varchar('first_name').notNull(),
	lastName: varchar('last_name'),
	role: rolesEnum().default('volunteer'),
	phoneNumber: varchar('phone_number'),
	email: varchar('email').notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
	coordinatingEvents: many(events)
}));

export const events = pgTable('events', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	coordinatorId: varchar('coordinator_id').references(() => users.id)
});

export const eventsRelations = relations(events, ({ one }) => ({
	coordinator: one(users, {
		fields: [events.coordinatorId],
		references: [users.id]
	})
}));
