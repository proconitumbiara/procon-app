import Image from "next/image";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import PriceComparisonTable from "@/components/website/price-comparison-table";
import { getPriceSearchBySlug } from "@/lib/data/content";
import { formatCentavosToBRL } from "@/lib/formatters";

export const dynamic = 'force-dynamic';

interface PriceSearchDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PriceSearchDetailPage({
  params,
}: PriceSearchDetailPageProps) {
  const { slug } = await params;
  const priceSearch = await getPriceSearchBySlug(slug);

  if (!priceSearch) {
    return (
      <>
        <Header />
        <main id="main-content" role="main" aria-label="Conteúdo principal">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-bold">
                Pesquisa de preço não encontrada
              </h1>
              <Link href="/pesquisas" className="text-primary hover:underline">
                Voltar para pesquisas de preço
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/pesquisas">Pesquisas de Preço</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  {priceSearch.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Conteúdo da pesquisa */}
          <article className="mx-auto max-w-6xl">
            {/* Imagem principal */}
            {priceSearch.coverImageUrl && (
              <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg sm:mb-8 sm:h-80 md:h-96">
                <Image
                  src={priceSearch.coverImageUrl}
                  alt={priceSearch.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
                  priority
                />
              </div>
            )}

            {/* Título */}
            <h1 className="text-foreground mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl md:text-4xl">
              {priceSearch.title}
            </h1>

            {/* Ano e informações */}
            <div className="mb-6 flex flex-wrap items-center gap-4 sm:mb-8">
              {priceSearch.year && (
                <p className="text-muted-foreground text-sm sm:text-base">
                  <span className="font-semibold">Ano:</span> {priceSearch.year}
                </p>
              )}
              {priceSearch.collectionDate && (
                <p className="text-muted-foreground text-sm sm:text-base">
                  <span className="font-semibold">Data da coleta:</span>{" "}
                  {new Date(priceSearch.collectionDate).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              )}
            </div>

            {/* Descrição */}
            {priceSearch.description && (
              <div className="prose prose-lg text-foreground prose-headings:text-foreground prose-p:text-foreground prose-p:leading-7 prose-p:mb-4 sm:prose-p:mb-6 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground mb-8 max-w-none">
                <p>{priceSearch.description}</p>
              </div>
            )}

            {/* Observação */}
            {priceSearch.observation && (
              <div className="prose prose-lg text-foreground prose-headings:text-foreground prose-p:text-foreground prose-p:leading-7 prose-p:mb-4 sm:prose-p:mb-6 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground mb-8 max-w-none">
                <div className="rounded-lg border-l-4 border-primary bg-muted/50 p-4">
                  <p className="font-semibold mb-2">Observação:</p>
                  <p>{priceSearch.observation}</p>
                </div>
              </div>
            )}

            {/* Seções por categoria */}
            {priceSearch.items.length > 0 &&
              (() => {
                // Agrupar itens por categoria
                const itemsByCategory = new Map<
                  string,
                  {
                    categoryId: string;
                    categoryName: string;
                    items: typeof priceSearch.items;
                  }
                >();

                priceSearch.items.forEach((item) => {
                  const categoryId = item.product.category.id;
                  const categoryName = item.product.category.name;

                  if (!itemsByCategory.has(categoryId)) {
                    itemsByCategory.set(categoryId, {
                      categoryId,
                      categoryName,
                      items: [],
                    });
                  }

                  itemsByCategory.get(categoryId)!.items.push(item);
                });

                // Ordenar categorias por nome
                const sortedCategories = Array.from(itemsByCategory.values()).sort(
                  (a, b) => a.categoryName.localeCompare(b.categoryName),
                );

                return sortedCategories.map((categoryData) => {
                  const { categoryName, items } = categoryData;

                  // Agrupar itens por produto para encontrar o produto mais barato e mais caro
                  const productsMap = new Map<
                    string,
                    {
                      productId: string;
                      productName: string;
                      minPrice: number;
                      maxPrice: number;
                    }
                  >();

                  items.forEach((item) => {
                    const productId = item.product.id;
                    if (!productsMap.has(productId)) {
                      productsMap.set(productId, {
                        productId,
                        productName: item.product.name,
                        minPrice: item.price,
                        maxPrice: item.price,
                      });
                    }
                    const product = productsMap.get(productId)!;
                    if (item.price < product.minPrice) {
                      product.minPrice = item.price;
                    }
                    if (item.price > product.maxPrice) {
                      product.maxPrice = item.price;
                    }
                  });

                  // Encontrar produto mais barato (menor preço mínimo)
                  let cheapestProduct = Array.from(productsMap.values())[0];
                  productsMap.forEach((product) => {
                    if (product.minPrice < cheapestProduct.minPrice) {
                      cheapestProduct = product;
                    }
                  });

                  // Encontrar produto mais caro (maior preço máximo)
                  let mostExpensiveProduct = Array.from(productsMap.values())[0];
                  productsMap.forEach((product) => {
                    if (product.maxPrice > mostExpensiveProduct.maxPrice) {
                      mostExpensiveProduct = product;
                    }
                  });

                  // Calcular média de preços da categoria
                  const totalPrices = items.reduce((sum, item) => sum + item.price, 0);
                  const averagePrice = totalPrices / items.length;

                  return (
                    <section key={categoryData.categoryId} className="mb-12">
                      <h2 className="mb-6 text-xl font-semibold sm:text-2xl">
                        {categoryName}
                      </h2>

                      {/* Resumo da categoria */}
                      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card className="border-green-600 dark:border-green-400">
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <p className="text-muted-foreground text-sm font-medium">
                                Produto Mais Barato
                              </p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCentavosToBRL(cheapestProduct.minPrice)}
                              </p>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {cheapestProduct.productName}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-red-600 dark:border-red-400">
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <p className="text-muted-foreground text-sm font-medium">
                                Produto Mais Caro
                              </p>
                              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {formatCentavosToBRL(mostExpensiveProduct.maxPrice)}
                              </p>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {mostExpensiveProduct.productName}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-primary">
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <p className="text-muted-foreground text-sm font-medium">
                                Média de Preços
                              </p>
                              <p className="text-primary text-2xl font-bold">
                                {formatCentavosToBRL(Math.round(averagePrice))}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                Média geral da categoria
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Tabela comparativa da categoria */}
                      <div className="mt-6">
                        <PriceComparisonTable items={items} />
                      </div>
                    </section>
                  );
                });
              })()}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
