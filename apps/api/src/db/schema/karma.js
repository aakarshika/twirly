import { pgTable, serial, text, varchar, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.js';

export const userActivityLog = pgTable('user_activity_log', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  activityType: varchar('activity_type', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id').notNull(),
  karmaPoints: integer('karma_points').notNull().default(0),
  pageName: varchar('page_name', { length: 255 }).notNull().default(''),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
