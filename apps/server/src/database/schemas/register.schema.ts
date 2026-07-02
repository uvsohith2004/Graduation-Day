import { pgTable, text, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { branchesTable } from "./branch.schema";
import { eligibility } from "./eligibility.schema";

export const alumni = pgTable('alumni', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(), // Ensures 1-to-1 relationship
  email: text('email').notNull(),
  student_name: text('student_name').notNull(),
  mobile_number: text('mobile_number').notNull(),
  branch: text('branch').notNull().references(() => branchesTable.name, { onDelete: "cascade", onUpdate: "cascade" }),
  hall_ticket_number: text('hall_ticket_number').notNull().references(() => eligibility.rollNumber, { onDelete: "cascade", onUpdate: "cascade" }),
  will_attend: boolean('will_attend').default(false).notNull(),
  guest_count: numeric('guest_count').notNull(),
  photo: text('photo').notNull(),
  photo_edit_request: boolean('photo_edit_request').default(false).notNull(),
  can_edit_photo: boolean('can_edit_photo').default(false).notNull(),
  event_date: text('event_date').notNull(),
  event_time: text('event_time').notNull(),
  venue: text('venue').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
});
