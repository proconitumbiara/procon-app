"use server";

import { db } from "@/db";
import { permissionedActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes } from "./schema";

export const getSectors = permissionedActionClient("sectors.view").action(
  async ({ ctx }) => {
    try {
      const sectorsRaw = await db.query.sectorsTable.findMany({
        with: {
          servicePoints: true,
        },
      });

      const sectors = sectorsRaw.filter((s) =>
        ctx.perms.canAccessSectorKey(s.key_name),
      );

      return { data: sectors };
    } catch {
      return {
        error: {
          type: ErrorTypes.SECTOR_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.SECTOR_NOT_FOUND],
        },
      };
    }
  },
);
