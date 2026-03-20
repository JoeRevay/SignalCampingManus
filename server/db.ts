import { eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, signalReports, type InsertSignalReport } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── Signal Reports ──

export async function createSignalReport(report: InsertSignalReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(signalReports).values(report);
    return { success: true };
  } catch (error) {
    console.warn("[Database] Failed to insert signal report:", error);
    throw new Error("Database not available");
  }
}

export async function getSignalReportAggregates(campgroundId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({
        carrier: signalReports.carrier,
        rating: signalReports.rating,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(signalReports)
      .where(eq(signalReports.campgroundId, campgroundId))
      .groupBy(signalReports.carrier, signalReports.rating);

    return rows;
  } catch (error) {
    console.warn("[Database] Failed to query signal reports:", error);
    return [];
  }
}

export async function getTotalReportsForCampground(campgroundId: string) {
  const db = await getDb();
  if (!db) return 0;

  try {
    const [row] = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(signalReports)
      .where(eq(signalReports.campgroundId, campgroundId));

    return row?.count ?? 0;
  } catch (error) {
    console.warn("[Database] Failed to count signal reports:", error);
    return 0;
  }
}
