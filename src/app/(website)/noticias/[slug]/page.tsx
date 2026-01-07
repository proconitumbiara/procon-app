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
import { newsDocumentsTable } from "@/db/schema";
import { getNewsBySlug } from "@/lib/data/content";

const DEFAULT_NEWS_IMAGE = "/LogoVertical.png";

interface NoticiaDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NoticiaDetailPage({
  params,
}: NoticiaDetailPageProps) {
  const { slug } = await params;
  const noticia = await getNewsBySlug(slug);

  if (!noticia) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Notícia não encontrada</h1>
          <Link href="/noticias" className="text-primary hover:underline">
            Voltar para notícias
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = noticia.publishedAt
    ? new Date(noticia.publishedAt).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const contentHtml =
    noticia.content ||
    "<p>Em breve adicionaremos mais detalhes sobre esta notícia.</p>";

  return (
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
                <Link href="/noticias">Notícias</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">
                {noticia.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Conteúdo da notícia */}
        <article className="mx-auto max-w-4xl">
          {/* Imagem principal */}
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg sm:mb-8 sm:h-80 md:h-96">
            <Image
              src={noticia.coverImageUrl || DEFAULT_NEWS_IMAGE}
              alt={noticia.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
              priority
            />
          </div>

          {/* Título */}
          <h1 className="text-foreground mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl md:text-4xl">
            {noticia.title}
          </h1>

          {/* Data de publicação */}
          {publishedDate && (
            <p className="text-muted-foreground mb-6 text-sm sm:mb-8 sm:text-base">
              Publicado em {publishedDate}
            </p>
          )}

          {/* Conteúdo */}
          <div
            className="prose prose-lg text-foreground prose-headings:text-foreground prose-p:text-foreground prose-p:leading-7 prose-p:mb-4 sm:prose-p:mb-6 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {noticia.documents && noticia.documents.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-semibold">Documentos</h2>
              <div className="space-y-3">
                {noticia.documents.map(
                  (documento: typeof newsDocumentsTable.$inferSelect) => (
                    <Link
                      key={documento.id}
                      href={documento.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border text-foreground hover:border-primary hover:text-primary flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
                    >
                      <span>{documento.label}</span>
                      <span className="text-muted-foreground text-xs">
                        Abrir documento
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}
