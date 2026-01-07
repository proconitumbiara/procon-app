import {
  Building2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Target,
  Users,
} from "lucide-react";
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
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import Section from "@/components/website/global/Section";

export default async function SobreNosPage() {
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
                <BreadcrumbPage>Sobre Nós</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
              Sobre Nós
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Conheça o Procon Itumbiara e nossa missão de proteger os direitos
              dos consumidores
            </p>
          </div>

          {/* Seção: Quem Somos */}
          <Section
            id="quem-somos"
            title="Quem Somos"
            description="O Procon Itumbiara é o órgão responsável pela proteção e defesa dos direitos dos consumidores em Itumbiara e região."
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <p className="text-foreground leading-7">
                    O{" "}
                    <strong>
                      Procon Itumbiara - Fundo Municipal de Proteção e Defesa do
                      Consumidor
                    </strong>{" "}
                    é um órgão público municipal que tem como objetivo principal
                    proteger e defender os direitos dos consumidores, oferecendo
                    orientação, mediação de conflitos e fiscalização de
                    estabelecimentos comerciais.
                  </p>
                  <p className="text-foreground leading-7">
                    Tem como missão principal, equilibrar e harmonizar as
                    relações entre consumidores e fornecedores e, por objetivo,
                    elaborar e executar a política de proteção e defesa dos
                    consumidores. Atuamos de forma gratuita e acessível,
                    prestando serviços à população de Itumbiara e região, sempre
                    com foco na educação para o consumo e na garantia dos
                    direitos estabelecidos pelo Código de Defesa do Consumidor
                    (CDC).
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative h-64 w-full overflow-hidden rounded-lg">
                    <Image
                      src="/LogoVertical.png"
                      alt="Logo do Procon Itumbiara"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Seção: Missão, Visão e Valores */}
          <Section id="missao-visao-valores" title="Missão, Visão e Valores">
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Target className="text-primary h-8 w-8" />
                  <h3 className="text-foreground text-xl font-semibold">
                    Missão
                  </h3>
                </div>
                <p className="text-foreground leading-7">
                  Proteger e defender os direitos dos consumidores, oferecendo
                  orientação, mediação de conflitos e fiscalização, sempre com
                  foco na educação para o consumo e na garantia dos direitos
                  estabelecidos pelo Código de Defesa do Consumidor.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="text-primary h-8 w-8" />
                  <h3 className="text-foreground text-xl font-semibold">
                    Visão
                  </h3>
                </div>
                <p className="text-foreground leading-7">
                  Ser referência em proteção ao consumidor, promovendo relações
                  comerciais mais justas e transparentes, com uma sociedade mais
                  consciente de seus direitos e deveres.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="text-primary h-8 w-8" />
                  <h3 className="text-foreground text-xl font-semibold">
                    Valores
                  </h3>
                </div>
                <ul className="text-foreground space-y-2 leading-7">
                  <li>• Transparência e ética</li>
                  <li>• Compromisso com o cidadão</li>
                  <li>• Educação para o consumo</li>
                  <li>• Acessibilidade e inclusão</li>
                  <li>• Eficiência no atendimento</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Seção: Informações Institucionais */}
          <Section
            id="informacoes-institucionais"
            title="Informações Institucionais"
          >
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="text-primary h-5 w-5" />
                  <h3 className="text-foreground font-semibold">
                    Razão Social
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-6">
                  Procon Itumbiara - Fundo Municipal de Proteção e Defesa do
                  Consumidor
                </p>
                <p className="text-muted-foreground text-sm leading-6">
                  <strong>CNPJ:</strong> 08.242.183/0001-63
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="text-primary h-5 w-5" />
                  <h3 className="text-foreground font-semibold">Endereço</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-6">
                  Av. Porto Nacional, 495
                  <br />
                  CEP: 75528-122
                  <br />
                  Itumbiara - GO
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="text-primary h-5 w-5" />
                  <h3 className="text-foreground font-semibold">
                    Horário de Atendimento
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-6">
                  Segunda a Sexta-feira
                  <br />
                  Das 7h às 13h
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="text-primary h-5 w-5" />
                  <h3 className="text-foreground font-semibold">Telefone</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-6">
                  <a
                    href="tel:+556434321215"
                    className="text-primary no-underline hover:underline"
                  >
                    (64) 3432-1215
                  </a>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="text-primary h-5 w-5" />
                  <h3 className="text-foreground font-semibold">E-mail</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-6">
                  <a
                    href="mailto:proconitumbiara@gmail.com"
                    className="text-primary no-underline hover:underline"
                  >
                    proconitumbiara@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </Section>

          {/* Seção: Nossos Serviços */}
          <Section
            id="nossos-servicos"
            title="Nossos Serviços"
            description="Conheça os principais serviços oferecidos pelo Procon Itumbiara"
            actionLink="/servicos"
            actionLabel="Ver todos os serviços"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="border-border rounded-lg border p-4">
                <h3 className="text-foreground mb-2 font-semibold">
                  Atendimento ao Consumidor
                </h3>
                <p className="text-muted-foreground text-sm leading-6">
                  Orientação sobre direitos do consumidor, esclarecimento de
                  dúvidas e informações sobre produtos e serviços.
                </p>
              </div>
              <div className="border-border rounded-lg border p-4">
                <h3 className="text-foreground mb-2 font-semibold">
                  Mediação de Conflitos
                </h3>
                <p className="text-muted-foreground text-sm leading-6">
                  Intermediação entre consumidor e fornecedor para resolução de
                  conflitos de consumo de forma rápida e eficiente.
                </p>
              </div>
              <div className="border-border rounded-lg border p-4">
                <h3 className="text-foreground mb-2 font-semibold">
                  Educação para o Consumo
                </h3>
                <p className="text-muted-foreground text-sm leading-6">
                  Palestras, campanhas educativas e materiais informativos para
                  conscientizar a população sobre seus direitos.
                </p>
              </div>
              <div className="border-border rounded-lg border p-4">
                <h3 className="text-foreground mb-2 font-semibold">
                  Fiscalização
                </h3>
                <p className="text-muted-foreground text-sm leading-6">
                  Fiscalização de estabelecimentos comerciais para garantir o
                  cumprimento do Código de Defesa do Consumidor.
                </p>
              </div>
            </div>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
