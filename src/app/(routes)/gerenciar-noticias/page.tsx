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
import { NewsWithDocuments } from "@/types/content-management";

import AddNewsButton from "./_components/add-news-button";
import NewsGrid from "./_components/news-grid";

const NoticiasPage = async () => {
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

  const news = await db.query.newsTable.findMany({
    orderBy: (table) => desc(table.createdAT),
    with: {
      documents: true,
    },
  });

  const formattedNews: NewsWithDocuments[] = news.map((item) => ({
    ...item,
    documents: [...item.documents].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    ),
  }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Notícias</PageTitle>
          <PageDescription>Gerencie as notícias publicadas.</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddNewsButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <NewsGrid news={formattedNews} />
      </PageContent>
    </PageContainer>
  );
};

export default NoticiasPage;

