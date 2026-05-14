import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export const feedback = pgTable('feedback', {
  id:        serial('id').primaryKey(),
  name:      text('name').notNull().default(''),
  type:      varchar('type', { length: 50 }).notNull().default('bug'),
  priority:  varchar('priority', { length: 20 }).notNull().default('medium'),
  message:   text('message').notNull(),
  imageUrl:  text('image_url'),
  status:    varchar('status', { length: 20 }).notNull().default('pending'),
  pageRoute: text('page_route').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
