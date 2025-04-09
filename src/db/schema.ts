import { relations } from 'drizzle-orm';
import {
	pgEnum,
	pgTable,
	primaryKey,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('roles', ['guardian', 'admin', 'volunteer']);

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
	liaisoningCenter: one(centerLiaisons, {
		fields: [users.id],
		references: [centerLiaisons.userId]
	}),
	guardianCenters: one(centerGuardians, {
		fields: [users.id],
		references: [centerGuardians.userId]
	})
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

export const centers = pgTable('centers', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	phoneNumber: varchar('phone_number'),
	email: varchar('email').notNull()
});

export const centersRelations = relations(centers, ({ many }) => ({
	liaisons: many(centerLiaisons),
	guardians: many(centerGuardians)
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
