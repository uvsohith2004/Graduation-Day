import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const importErrors = pgTable('import_errors', {
  id: text('id').primaryKey(),
  rollNumber: text('roll_number'),
  studentName: text('student_name'),
  branch: text('branch'),
  errorReason: text('error_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
