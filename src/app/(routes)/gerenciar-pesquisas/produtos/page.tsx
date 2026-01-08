import { asc, eq } from "drizzle-orm";
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

import AddProductButton from "./_components/add-product-button";
import ProductsFilters from "./_components/products-filters";

const ProdutosPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  if (user?.role !== "administrator") {
    return <AccessDenied />;
  }

  const [products, categories] = await Promise.all([
    db.query.productsTable.findMany({
      orderBy: (table) => asc(table.name),
      with: {
        category: true,
      },
    }),
    db.query.categoriesTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Produtos</PageTitle>
          <PageDescription>
            Gerencie o catálogo de produtos e suas categorias.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddProductButton categories={categories} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <ProductsFilters products={products} categories={categories} />
      </PageContent>
    </PageContainer>
  );
};

export default ProdutosPage;

