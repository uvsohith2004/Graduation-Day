import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  isReplied: boolean("is_replied").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessageReplies = pgTable("contact_message_replies", {
  id: text("id").primaryKey(),
  contactMessageId: text("contact_message_id")
    .notNull()
    .references(() => contactMessages.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
