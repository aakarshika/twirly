import { pgTable, serial, text, varchar, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { user } from './auth.js';
import { comparisonSetComments } from './trending.js';

export const commentReactions = pgTable('comparison_set_comment_reactions', {
  id: serial('id').primaryKey(),
  commentId: integer('comment_id').notNull().references(() => comparisonSetComments.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  reactionType: varchar('reaction_type', { length: 10 }).notNull().default('like'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.commentId, t.userId),
]);
