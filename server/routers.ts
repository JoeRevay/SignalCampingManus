import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSignalReport, getSignalReportAggregates, getDb } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  signalReports: router({
    /** Get aggregate signal report counts for a campground */
    getAggregates: publicProcedure
      .input(z.object({ campgroundId: z.string().min(1) }))
      .query(async ({ input }) => {
        const rows = await getSignalReportAggregates(input.campgroundId);
        // Transform flat rows into a structured object
        const carriers = ["Verizon", "AT&T", "T-Mobile"] as const;
        const ratings = ["Strong", "Usable", "No Signal"] as const;

        const result: Record<string, Record<string, number>> = {};
        for (const carrier of carriers) {
          result[carrier] = {};
          for (const rating of ratings) {
            result[carrier][rating] = 0;
          }
        }

        let totalReports = 0;
        for (const row of rows) {
          if (result[row.carrier]) {
            result[row.carrier][row.rating] = Number(row.count);
            totalReports += Number(row.count);
          }
        }

        return { aggregates: result, totalReports };
      }),

    /** Submit a new signal report (anonymous, no auth required) */
    submit: publicProcedure
      .input(
        z.object({
          campgroundId: z.string().min(1),
          carrier: z.enum(["Verizon", "AT&T", "T-Mobile"]),
          rating: z.enum(["Strong", "Usable", "No Signal"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "NO_DATABASE",
          });
        }
        await createSignalReport({
          campgroundId: input.campgroundId,
          carrier: input.carrier,
          rating: input.rating,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
