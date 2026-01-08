import type { LucideIcon } from "lucide-react";
import { Baby, Book, Eye, Globe, Hand, Smile } from "lucide-react";

import CDCCard from "@/components/website/cards/CDCCard";
import ContactCard from "@/components/website/cards/ContactCard";
import NewsCard from "@/components/website/cards/NewsCard";
import PriceSearchCard from "@/components/website/cards/PriceSearchCard";
import ProjectCard from "@/components/website/cards/ProjectCard";
import ServiceCard from "@/components/website/cards/ServiceCard";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import Section from "@/components/website/global/Section";
import type { FAQItem } from "@/components/website/home/FAQ";
import FAQ from "@/components/website/home/FAQ";
import Hero from "@/components/website/home/Hero";
import { getAllPriceSearches } from "@/lib/data/content";
import {
  getIndexProjects,
  getIndexPublishedNews,
  getIndexServices,
} from "@/lib/data/index-content";

const DEFAULT_PROJECT_IMAGE = "/LogoVertical.png";
const DEFAULT_NEWS_IMAGE = "/LogoVertical.png";
const DEFAULT_PRICE_SEARCH_IMAGE = "/LogoVertical.png";

const SERVICE_ICON_MAP: Record<string, LucideIcon | undefined> = {
  "atendimento-ao-consumidor": Hand,
  "mediacao-de-conflitos": Hand,
  "educacao-para-o-consumo": Book,
};

export default async function Home() {
  const [services, projects, newsItems, priceSearches] = await Promise.all([
    getIndexServices(),
    getIndexProjects(),
    getIndexPublishedNews(),
    getAllPriceSearches(),
  ]);

  const featuredServices = services.slice(0, 3);
  const featuredProjects = projects.slice(0, 3);
  const featuredNews = newsItems.slice(0, 3);

  const faqItems: FAQItem[] = [
    {
      id: "1",
      question: "O que é o Procon?",
      answer:
        "O Procon (Programa de Proteção e Defesa do Consumidor) é um órgão público que tem como objetivo proteger os direitos dos consumidores, oferecendo orientação, mediação de conflitos e fiscalização de estabelecimentos comerciais.",
    },
    {
      id: "2",
      question: "Como posso fazer uma reclamação?",
      answer:
        "Você pode fazer uma reclamação presencialmente em nossa sede, através do nosso site ou por telefone. É necessário apresentar documentos pessoais e comprovantes relacionados à sua reclamação.",
    },
    {
      id: "3",
      question: "Quais são os principais direitos do consumidor?",
      answer:
        "Os principais direitos do consumidor incluem: proteção da vida e saúde, educação para o consumo, informação adequada sobre produtos e serviços, proteção contra publicidade enganosa e abusiva, e direito à revisão de cláusulas contratuais.",
    },
    {
      id: "4",
      question: "O Procon pode me ajudar com problemas de compras online?",
      answer:
        "Sim, o Procon pode auxiliar em problemas relacionados a compras online, como atraso na entrega, produtos diferentes do anunciado, problemas com cancelamento e devolução, entre outros casos previstos no Código de Defesa do Consumidor.",
    },
    {
      id: "5",
      question: "Quanto custa o atendimento do Procon?",
      answer:
        "O atendimento do Procon é totalmente gratuito. Não há cobrança de taxas ou valores para abertura de reclamações, mediação de conflitos ou orientações ao consumidor.",
    },
    {
      id: "6",
      question: "Quanto tempo leva para resolver uma reclamação?",
      answer:
        "O tempo de resolução varia conforme a complexidade do caso e a disponibilidade da empresa para negociação. Em média, processos de mediação podem levar de 30 a 90 dias. Casos mais complexos podem levar mais tempo.",
    },
  ];

  return (
    <>
      <Header />
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        {/* Hero */}
        <Hero title="Bem-vindo ao Portal do Procon Itumbiara" />

        {/* Serviços */}
        <Section
          id="servicos"
          title="Nossos Serviços"
          description="Conheça os serviços que oferecemos para você"
          actionLink="/servicos"
          actionLabel="Todos os serviços"
        >
          {featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.title}
                  description={
                    service.description ||
                    "Descrição deste serviço estará disponível em breve."
                  }
                  slug={service.slug}
                  status={service.isActive ? "active" : "inactive"}
                  icon={SERVICE_ICON_MAP[service.slug]}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Ainda não há serviços cadastrados. Assim que disponíveis, eles
              aparecerão aqui.
            </p>
          )}
        </Section>

        {/* Pesquisas */}
        <Section
          id="pesquisas"
          title="Pesquisas"
          description="Conheça as pesquisas que realizamos para você"
          actionLink="/pesquisas"
          actionLabel="Todas as pesquisas"
        >
          {priceSearches.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {priceSearches.map((search) => (
                <PriceSearchCard
                  key={search.id}
                  id={search.id}
                  title={search.title}
                  description={
                    search.description ||
                    "Descrição deste serviço estará disponível em breve."
                  }
                  slug={search.slug}
                  image={search.coverImageUrl || DEFAULT_PRICE_SEARCH_IMAGE}
                  imageAlt={search.title}
                  year={search.year}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Ainda não há serviços cadastrados. Assim que disponíveis, eles
              aparecerão aqui.
            </p>
          )}
        </Section>

        {/* Projetos */}
        <Section
          id="projetos"
          title="Projetos"
          description="Conheça os projetos que estão sendo realizados pelo Procon"
          actionLink="/projetos"
          actionLabel="Todos os projetos"
        >
          {featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
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
          ) : (
            <p className="text-muted-foreground">
              Nenhum projeto publicado até o momento. Em breve traremos novas
              iniciativas do Procon Itumbiara.
            </p>
          )}
        </Section>

        {/* Notícias */}
        <Section
          id="noticias"
          title="Notícias"
          description="Conheça as notícias que estão acontecendo no Procon"
          actionLink="/noticias"
          actionLabel="Todas as notícias"
        >
          {featuredNews.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredNews.map((news) => (
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
            <p className="text-muted-foreground">
              Nenhuma notícia publicada no momento. Volte em breve para conferir
              as novidades do Procon Itumbiara.
            </p>
          )}
        </Section>

        {/* CDC */}
        <Section
          id="cdc"
          title="Código de Defesa do Consumidor"
          description="Conheça mais sobre o Código de Defesa do Consumidor"
        >
          <div className="mt-8 space-y-12">
            <div>
              <h2 className="mb-6 text-center text-2xl font-bold">
                CDC Completo
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <CDCCard
                  title="CDC Completo"
                  description="Acesse o Código de Defesa do Consumidor convencional"
                  href="http://www.pcdlegal.com.br/cdc/convencional/"
                  icon={Book}
                />
                <CDCCard
                  title="CDC Digital"
                  description="Acesse o Código de Defesa do Consumidor digital"
                  href="http://www.pcdlegal.com.br/cdc/wp-content/themes/pcdlegal/livrodigital/2/index.html"
                  icon={Globe}
                />
                <CDCCard
                  title="CDC Simplificado"
                  description="Acesse o Código de Defesa do Consumidor simplificado"
                  href="http://www.pcdlegal.com.br/cdc/wp-content/themes/pcdlegal/livrodigitalsimplificado/index.html"
                  icon={Baby}
                />
              </div>
            </div>
            <div>
              <h2 className="mb-6 text-center text-2xl font-bold">
                CDC Acessível
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <CDCCard
                  title="CDC em Libras"
                  description="Acesse o Código de Defesa do Consumidor em Libras"
                  href="http://www.pcdlegal.com.br/cdc/libras/"
                  icon={Hand}
                />
                <CDCCard
                  title="CDC para Deficientes Visuais"
                  description="Acesse o Código de Defesa do Consumidor para deficientes visuais"
                  href="http://www.pcdlegal.com.br/cdc/deficiente-visual/"
                  icon={Eye}
                />
                <CDCCard
                  title="PCD Legal"
                  description="Uma biblioteca virtual com conteúdo acessível a todos os cidadãos."
                  href="http://www.pcdlegal.com.br/"
                  icon={Smile}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Dúvidas Frequentes */}
        <Section
          id="duvidas-frequentes"
          title="Dúvidas Frequentes"
          description="Veja as dúvidas frequentes sobre o Procon"
        >
          <FAQ items={faqItems} />
        </Section>

        {/* Contato */}
        <Section
          id="contato"
          title="Entre em Contato"
          description="Estamos à disposição para ajudar você"
        >
          <div className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
            <ContactCard
              type="phone"
              label="Telefone"
              value="(64) 3432-1215"
              href="tel:+556434321215"
            />
            <ContactCard
              type="instagram"
              label="Instagram"
              value="@proconitumbiara"
              href="https://www.instagram.com/proconitumbiara?igsh=MWltYjdoNXh2bm43bA=="
            />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
