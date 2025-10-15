import { eq } from "drizzle-orm";

import { db } from "@/db";
import { complaintsTable, consultationsTable, denunciationsTable } from "@/db/schema";

export interface TreatmentResolution {
  complaint?: {
    id: string;
    caseNumber: string | null;
    consumerName: string | null;
    supplierName: string | null;
    status: string;
    authorizationArquive: string | null;
    createdAT: Date;
    updatedAt: Date | null;
  };
  denunciation?: {
    id: string;
    denunciationNumber: string | null;
    authorizationArquive: string | null;
    createdAT: Date;
    updatedAt: Date | null;
  };
  consultation?: {
    id: string;
    consultationNumber: string | null;
    authorizationArquive: string | null;
    createdAT: Date;
    updatedAt: Date | null;
  };
}

export async function getTreatmentResolution(treatmentId: string): Promise<TreatmentResolution> {
  const [complaint, denunciation, consultation] = await Promise.all([
    db.query.complaintsTable.findFirst({
      where: eq(complaintsTable.treatmentId, treatmentId),
    }),
    db.query.denunciationsTable.findFirst({
      where: eq(denunciationsTable.treatmentId, treatmentId),
    }),
    db.query.consultationsTable.findFirst({
      where: eq(consultationsTable.treatmentId, treatmentId),
    }),
  ]);

  return {
    complaint: complaint || undefined,
    denunciation: denunciation || undefined,
    consultation: consultation || undefined,
  };
}
