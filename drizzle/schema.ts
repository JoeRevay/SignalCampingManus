import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Camper signal reports — anonymous crowdsourced signal quality reports.
 * No user account required. Stores carrier + rating per campground.
 */
export const signalReports = mysqlTable("signal_reports", {
  id: int("id").autoincrement().primaryKey(),
  /** Campground slug identifier (matches the slug from the JSON dataset) */
  campgroundId: varchar("campgroundId", { length: 255 }).notNull(),
  /** Carrier name: Verizon, AT&T, or T-Mobile */
  carrier: mysqlEnum("carrier", ["Verizon", "AT&T", "T-Mobile"]).notNull(),
  /** Signal quality rating */
  rating: mysqlEnum("rating", ["Strong", "Usable", "No Signal"]).notNull(),
  /** When the report was submitted */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignalReport = typeof signalReports.$inferSelect;
export type InsertSignalReport = typeof signalReports.$inferInsert;
