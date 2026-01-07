import { desc, eq } from "drizzle-orm";
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
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddProjectButton from "./_components/add-project-button";
import ProjectsGrid from "./_components/projects-grid";

const ProjetosPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  if (user?.role !== "administrator") {
    return <AccessDenied />;
  }

  const projects = await db.query.projectsTable.findMany({
    orderBy: (table) => desc(table.createdAT),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Projetos</PageTitle>
          <PageDescription>
            Acompanhe e organize os projetos institucionais.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddProjectButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <ProjectsGrid projects={projects} />
      </PageContent>
    </PageContainer>
  );
};

export default ProjetosPage;
