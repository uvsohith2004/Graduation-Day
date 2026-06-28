import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core"

export const ticketTemplate = pgTable("ticket_template", {
  id: text("id").primaryKey(), // We'll just use a single hardcoded ID like 'default'
  bgImageUrl: text("bg_image_url").notNull(),
  config: jsonb("config").notNull(), // Stores field coordinates { name: { x, y, w, h }, ... }
  updatedAt: timestamp("updated_at").defaultNow(),
})
