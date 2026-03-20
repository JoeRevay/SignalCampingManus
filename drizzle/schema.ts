import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 10 }).notNull().default("user"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Camper signal reports — anonymous crowdsourced signal quality reports.
 * No user account required. Stores carrier + rating per campground.
 */
export const signalReports = pgTable("signal_reports", {
  id: serial("id").primaryKey(),
  campgroundId: varchar("campgroundId", { length: 255 }).notNull(),
  carrier: varchar("carrier", { length: 32 }).notNull(),
  rating: varchar("rating", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignalReport = typeof signalReports.$inferSelect;
export type InsertSignalReport = typeof signalReports.$inferInsert;
