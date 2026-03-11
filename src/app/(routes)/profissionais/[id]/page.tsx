import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import ProfessionalDetailClient from "./_components/professional-detail-client";

interface ProfessionalDetailPageProps {
  params: Promise<{ id: string }>;
}

const ProfessionalDetailPage = async ({ params }: ProfessionalDetailPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const { id } = await params;

  if (
    session.user.role === "professional" &&
    id !== session.user.id
  ) {
    redirect("/profissionais");
  }

  const [professional] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  if (!professional) {
    notFound();
  }

  const showActions = session.user.role === "administrator";

  return (
    <ProfessionalDetailClient
      professional={professional}
      professionalId={id}
      showActions={showActions}
    />
  );
};

export default ProfessionalDetailPage;
