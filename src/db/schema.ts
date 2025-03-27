import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('roles', ['guardian', 'admin', 'volunteer']);

export const users = pgTable('users', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	role: rolesEnum().default('volunteer')
});

export const usersRelations = relations(users, ({ many }) => ({
	coordinatingEvents: many(events)
}));

export const events = pgTable('events', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	coordinatorId: varchar('coordinator_id').references(() => users.id)
});

export const eventsRelations = relations(events, ({ one }) => ({
	coordinator: one(users, {
		fields: [events.coordinatorId],
		references: [users.id]
	})
}));
