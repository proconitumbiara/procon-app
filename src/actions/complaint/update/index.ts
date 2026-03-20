"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { complaintsTable } from "@/db/schema";
import { permissionedActionClient } from "@/lib/next-safe-action";
import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const updateComplaint = permissionedActionClient("complaints.manage")
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const complaint = await db.query.complaintsTable.findFirst({
      where: eq(complaintsTable.id, parsedInput.complaintId),
    });

    if (!complaint) {
      return {
        error: {
          type: ErrorTypes.COMPLAINT_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.COMPLAINT_NOT_FOUND],
        },
      };
    }

    await db
      .update(complaintsTable)
      .set({
        viewingStatus: "viewed",
        viewingDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(complaintsTable.id, parsedInput.complaintId));

    revalidatePath("/denuncias");
    revalidatePath(`/denuncias/${parsedInput.complaintId}`);
  });
