import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: text("id").primaryKey(),
  adminUserId: text("admin_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  targetUserId: text("target_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
