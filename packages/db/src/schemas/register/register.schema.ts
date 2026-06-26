import { pgTable, text, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { user } from "../auth/auth.schema";

export const alumni = pgTable('alumni', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(), // Ensures 1-to-1 relationship
  email: text('email').notNull(),
  student_name: text('student_name').notNull(),
  mobile_number: text('mobile_number').notNull(),
  branch: text('branch').notNull(),
  hall_ticket_number: text('hall_ticket_number').notNull(),
  will_attend: boolean('will_attend').default(false).notNull(),
  guest_count: numeric('guest_count').notNull(),
  photo: text('photo').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
});
