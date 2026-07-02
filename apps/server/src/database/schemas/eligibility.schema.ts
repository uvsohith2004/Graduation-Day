import { pgTable, serial, varchar, text, uniqueIndex } from "drizzle-orm/pg-core";
import { branchesTable } from "./branch.schema";

export const eligibility = pgTable(
  "eligibility",
  {
    id: serial("id").primaryKey(),
    rollNumber: varchar("roll_number", { length: 20 }).notNull().unique(),
    studentName: varchar("student_name", { length: 255 }).notNull(),
    branch: text("branch").notNull().references(() => branchesTable.name, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => ({
    rollNumberIdx: uniqueIndex("eligibility_roll_number_idx").on(
      table.rollNumber
    ),
  })
);
