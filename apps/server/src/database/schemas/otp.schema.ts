import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const otpCodes = pgTable("otp_codes", {
  id: text("id").primaryKey(),
  adminUserId: text("admin_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  targetUserId: text("target_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
