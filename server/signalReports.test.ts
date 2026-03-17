import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();

  // In-memory store for test
  let reports: Array<{ campgroundId: string; carrier: string; rating: string }> = [];

  return {
    ...actual,
    createSignalReport: vi.fn(async (report: { campgroundId: string; carrier: string; rating: string }) => {
      reports.push(report);
      return { success: true };
    }),
    getSignalReportAggregates: vi.fn(async (campgroundId: string) => {
      const filtered = reports.filter((r) => r.campgroundId === campgroundId);
      const counts: Record<string, Record<string, number>> = {};
      for (const r of filtered) {
        const key = `${r.carrier}|${r.rating}`;
        if (!counts[key]) counts[key] = { carrier: r.carrier as any, rating: r.rating as any, count: 0 };
        (counts[key] as any).count++;
      }
      return Object.values(counts).map((v: any) => ({
        carrier: v.carrier,
        rating: v.rating,
        count: v.count,
      }));
    }),
    // Expose a way to reset the store between tests
    _resetReports: () => {
      reports = [];
    },
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("signalReports", () => {
  beforeEach(async () => {
    const db = await import("./db");
    (db as any)._resetReports?.();
  });

  describe("submit", () => {
    it("accepts a valid Verizon Strong report", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.signalReports.submit({
        campgroundId: "test-campground-slug",
        carrier: "Verizon",
        rating: "Strong",
      });

      expect(result).toEqual({ success: true });
    });

    it("accepts a valid AT&T Usable report", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.signalReports.submit({
        campgroundId: "another-campground",
        carrier: "AT&T",
        rating: "Usable",
      });

      expect(result).toEqual({ success: true });
    });

    it("accepts a valid T-Mobile No Signal report", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.signalReports.submit({
        campgroundId: "remote-campground",
        carrier: "T-Mobile",
        rating: "No Signal",
      });

      expect(result).toEqual({ success: true });
    });

    it("rejects an empty campgroundId", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.signalReports.submit({
          campgroundId: "",
          carrier: "Verizon",
          rating: "Strong",
        })
      ).rejects.toThrow();
    });

    it("rejects an invalid carrier", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.signalReports.submit({
          campgroundId: "test",
          carrier: "Sprint" as any,
          rating: "Strong",
        })
      ).rejects.toThrow();
    });

    it("rejects an invalid rating", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.signalReports.submit({
          campgroundId: "test",
          carrier: "Verizon",
          rating: "Excellent" as any,
        })
      ).rejects.toThrow();
    });
  });

  describe("getAggregates", () => {
    it("returns empty aggregates for a campground with no reports", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.signalReports.getAggregates({
        campgroundId: "empty-campground",
      });

      expect(result.totalReports).toBe(0);
      expect(result.aggregates).toBeDefined();
      expect(result.aggregates.Verizon.Strong).toBe(0);
      expect(result.aggregates["AT&T"].Usable).toBe(0);
      expect(result.aggregates["T-Mobile"]["No Signal"]).toBe(0);
    });

    it("returns correct aggregates after submitting reports", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Submit multiple reports
      await caller.signalReports.submit({
        campgroundId: "popular-campground",
        carrier: "Verizon",
        rating: "Strong",
      });
      await caller.signalReports.submit({
        campgroundId: "popular-campground",
        carrier: "Verizon",
        rating: "Strong",
      });
      await caller.signalReports.submit({
        campgroundId: "popular-campground",
        carrier: "AT&T",
        rating: "Usable",
      });

      const result = await caller.signalReports.getAggregates({
        campgroundId: "popular-campground",
      });

      expect(result.totalReports).toBe(3);
      expect(result.aggregates.Verizon.Strong).toBe(2);
      expect(result.aggregates["AT&T"].Usable).toBe(1);
    });

    it("does not mix reports from different campgrounds", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await caller.signalReports.submit({
        campgroundId: "campground-a",
        carrier: "Verizon",
        rating: "Strong",
      });
      await caller.signalReports.submit({
        campgroundId: "campground-b",
        carrier: "Verizon",
        rating: "No Signal",
      });

      const resultA = await caller.signalReports.getAggregates({
        campgroundId: "campground-a",
      });
      const resultB = await caller.signalReports.getAggregates({
        campgroundId: "campground-b",
      });

      expect(resultA.totalReports).toBe(1);
      expect(resultA.aggregates.Verizon.Strong).toBe(1);
      expect(resultA.aggregates.Verizon["No Signal"]).toBe(0);

      expect(resultB.totalReports).toBe(1);
      expect(resultB.aggregates.Verizon["No Signal"]).toBe(1);
      expect(resultB.aggregates.Verizon.Strong).toBe(0);
    });

    it("rejects an empty campgroundId", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.signalReports.getAggregates({ campgroundId: "" })
      ).rejects.toThrow();
    });

    it("has correct structure with all carriers and ratings", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.signalReports.getAggregates({
        campgroundId: "structure-test",
      });

      const carriers = ["Verizon", "AT&T", "T-Mobile"];
      const ratings = ["Strong", "Usable", "No Signal"];

      for (const carrier of carriers) {
        expect(result.aggregates[carrier]).toBeDefined();
        for (const rating of ratings) {
          expect(typeof result.aggregates[carrier][rating]).toBe("number");
        }
      }
    });
  });
});
