import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/ui/access-denied";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  usersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import OperationsCard from "./_components/operations-card";

const Operations = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/");
  }

  // Buscar operações com status 'operating', incluindo joins e atendimentos
  const operations = await db.query.operationsTable.findMany({
    where: (op, { eq }) => eq(op.status, "operating"),
    with: {
      servicePoint: {
        with: {
          sector: true,
        },
      },
      user: true,
      treatments: {
        where: (treatment, { eq }) => eq(treatment.status, "in_service"),
        with: {
          ticket: {
            with: {
              client: true,
            },
          },
        },
      },
    },
  });

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  if (user?.role !== "administrator") {
    return <AccessDenied />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Operações</PageTitle>
          <PageDescription>
            Gerencie as operações do seu atendimento
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <></>
        </PageActions>
      </PageHeader>
      <PageContent>
        <OperationsCard operations={operations} />
      </PageContent>
    </PageContainer>
  );
};

export default Operations;
