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
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import { getPublishedNews } from "@/lib/data/content";

const DEFAULT_NEWS_IMAGE = "/LogoHorizontal.png";

export default async function NoticiasPage() {
  const newsItems = await getPublishedNews();
  const hasNews = newsItems.length > 0;

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
                <BreadcrumbPage>Notícias</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
              Todas as Notícias
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Fique por dentro das últimas notícias e ações do Procon Itumbiara
            </p>
          </div>

          {/* Grid de notícias */}
          {hasNews ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {newsItems.map((news) => (
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
          ) : (
            <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center">
              Nenhuma notícia publicada no momento. Volte em breve para conferir
              as novidades do Procon Itumbiara.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
