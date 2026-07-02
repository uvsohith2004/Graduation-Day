import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core"

export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  isRegistrationOpen: boolean("is_registration_open").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})
