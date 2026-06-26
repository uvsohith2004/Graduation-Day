import { pgTable, serial, varchar, uniqueIndex } from "drizzle-orm/pg-core";

export const eligibility = pgTable(
  "eligibility",
  {
    id: serial("id").primaryKey(),
    rollNumber: varchar("roll_number", { length: 20 }).notNull(),
    studentName: varchar("student_name", { length: 255 }).notNull(),
    branch: varchar("branch", { length: 100 }).notNull(),
  },
  (table) => ({
    rollNumberIdx: uniqueIndex("eligibility_roll_number_idx").on(
      table.rollNumber
    ),
  })
);
