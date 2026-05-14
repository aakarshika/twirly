import { pgTable, serial, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './auth.js';
import { items, comparisonSets } from './trending.js';

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  itemId: integer('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  likes: integer('likes').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const reviewLikes = pgTable('review_likes', {
  reviewId: integer('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [primaryKey({ columns: [t.reviewId, t.userId] })]);

export const comparisonSetLikes = pgTable('comparison_set_likes', {
  setId: integer('set_id').notNull().references(() => comparisonSets.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [primaryKey({ columns: [t.setId, t.userId] })]);
