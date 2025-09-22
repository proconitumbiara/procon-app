"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { sectorsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes } from "./schema";

export const getSectors = actionClient
  .schema(
    z.object({
      sectorId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const sectors = await db.query.sectorsTable.findMany({
        where: eq(sectorsTable.id, parsedInput.sectorId),
        with: {
          servicePoints: true,
        },
      });

      if (!sectors) {
        return {
          error: {
            type: ErrorTypes.SECTOR_NOT_FOUND,
            message: ErrorMessages[ErrorTypes.SECTOR_NOT_FOUND],
          },
        };
      }

      return sectors;
    } catch {
      return {
        error: {
          type: ErrorTypes.SECTOR_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.SECTOR_NOT_FOUND],
        },
      };
    }
  });
