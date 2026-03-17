import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { buildUserPermissions } from "@/lib/authorization";

import ProfessionalDetailClient from "./_components/professional-detail-client";

interface ProfessionalDetailPageProps {
  params: Promise<{ id: string }>;
}

const ProfessionalDetailPage = async ({
  params,
}: ProfessionalDetailPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const perms = buildUserPermissions({
    id: session.user.id,
    role: session.user.role,
    profile: (session.user as any).profile,
  });

  const { id } = await params;

  const isTechnician =
    perms.profile === "tecnico-geral" ||
    perms.profile === "tecnico-atendimento" ||
    perms.profile === "tecnico-juridico";

  // Técnicos só podem ver o próprio perfil pela rota dinâmica
  if (isTechnician && id !== session.user.id) {
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

  const showActions =
    perms.can("sectors.manage") || session.user.role === "administrator";

  return (
    <ProfessionalDetailClient
      professional={professional}
      professionalId={id}
      showActions={showActions}
    />
  );
};

export default ProfessionalDetailPage;

