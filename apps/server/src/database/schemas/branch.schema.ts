import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const branchesTable = pgTable("branches", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  venue: text("venue").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
