import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import NewsCard from "@/components/website/cards/NewsCard";
import ProjectCard from "@/components/website/cards/ProjectCard";
import ServiceCard from "@/components/website/cards/ServiceCard";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import { searchNews, searchProjects, searchServices } from "@/lib/data/content";

const DEFAULT_NEWS_IMAGE = "/LogoHorizontal.png";
const DEFAULT_PROJECT_IMAGE = "/LogoVertical.png";

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  // Se não houver query, mostrar página vazia
  if (!query) {
    return (
      <>
        <Header />
        <main id="main-content" role="main" aria-label="Conteúdo principal">
          <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Início</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Busca</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mb-8">
              <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
                Busca
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Digite um termo de busca para encontrar notícias, projetos e
                serviços
              </p>
            </div>

            <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center">
              Por favor, digite um termo de busca para começar.
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Buscar em paralelo
  const [newsResults, projectsResults, servicesResults] = await Promise.all([
    searchNews(query),
    searchProjects(query),
    searchServices(query),
  ]);

  const totalResults =
    newsResults.length + projectsResults.length + servicesResults.length;

  return (
    <>
      <Header />
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Busca</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
              Resultados da Busca
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {totalResults > 0
                ? `Encontrados ${totalResults} resultado${
                    totalResults !== 1 ? "s" : ""
                  } para "${query}"`
                : `Nenhum resultado encontrado para "${query}"`}
            </p>
          </div>

          {/* Resultados */}
          {totalResults === 0 ? (
            <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center">
              <p className="mb-2 text-lg font-medium">
                Nenhum resultado encontrado
              </p>
              <p>
                Tente usar termos diferentes ou verifique a ortografia da sua
                busca.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Notícias */}
              {newsResults.length > 0 && (
                <section>
                  <h2 className="text-foreground mb-4 text-2xl font-semibold">
                    Notícias ({newsResults.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {newsResults.map((news) => (
                      <NewsCard
                        key={news.id}
                        id={news.id}
                        title={news.title}
                        image={news.coverImageUrl || DEFAULT_NEWS_IMAGE}
                        description={
                          news.excerpt ||
                          "Conteúdo em breve. Novas notícias serão publicadas aqui."
                        }
                        slug={news.slug}
                        imageAlt={news.title}
                        publishedAt={news.publishedAt || news.createdAT}
                        status={news.isPublished ? "published" : "draft"}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Projetos */}
              {projectsResults.length > 0 && (
                <section>
                  <h2 className="text-foreground mb-4 text-2xl font-semibold">
                    Projetos ({projectsResults.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projectsResults.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        name={project.title}
                        description={
                          project.summary ||
                          project.description ||
                          "Descrição não disponível no momento."
                        }
                        slug={project.slug}
                        image={project.coverImageUrl || DEFAULT_PROJECT_IMAGE}
                        imageAlt={project.title}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Serviços */}
              {servicesResults.length > 0 && (
                <section>
                  <h2 className="text-foreground mb-4 text-2xl font-semibold">
                    Serviços ({servicesResults.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {servicesResults.map((service) => (
                      <ServiceCard
                        key={service.id}
                        id={service.id}
                        name={service.title}
                        description={
                          service.description ||
                          "Descrição detalhada deste serviço estará disponível em breve."
                        }
                        slug={service.slug}
                        status={service.isActive ? "active" : "inactive"}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
