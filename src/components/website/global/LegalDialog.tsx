"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LegalDialogProps {
  type: "privacy" | "terms" | "accessibility";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LegalDialog({
  type,
  open,
  onOpenChange,
}: LegalDialogProps) {
  const renderContent = () => {
    switch (type) {
      case "privacy":
        return <PrivacyContent />;
      case "terms":
        return <TermsContent />;
      case "accessibility":
        return <AccessibilityContent />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "privacy":
        return "Política de Privacidade";
      case "terms":
        return "Termos de Uso";
      case "accessibility":
        return "Acessibilidade";
      default:
        return "";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "privacy":
        return "Informações sobre como coletamos, utilizamos e protegemos seus dados pessoais.";
      case "terms":
        return "Termos e condições de uso do site do Procon Itumbiara.";
      case "accessibility":
        return "Informações sobre os mecanismos de acessibilidade disponíveis no site.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[90%] overflow-y-auto sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="text-foreground space-y-4 text-sm leading-relaxed">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          1. Informações Coletadas
        </h3>
        <p className="text-muted-foreground mb-2">
          O Procon Itumbiara coleta informações pessoais quando você:
        </p>
        <ul className="text-muted-foreground ml-6 list-disc space-y-1">
          <li>Preenche formulários de atendimento ou reclamação</li>
          <li>Entra em contato conosco por e-mail ou telefone</li>
          <li>Navega em nosso site (dados de navegação e cookies)</li>
          <li>Registra-se para receber notícias ou atualizações</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          As informações coletadas podem incluir: nome completo, CPF, endereço,
          telefone, e-mail, dados de navegação e outras informações necessárias
          para prestação dos serviços.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          2. Como Utilizamos as Informações
        </h3>
        <p className="text-muted-foreground mb-2">
          Utilizamos suas informações pessoais para:
        </p>
        <ul className="text-muted-foreground ml-6 list-disc space-y-1">
          <li>Prestar serviços de proteção e defesa do consumidor</li>
          <li>Processar reclamações, consultas e denúncias</li>
          <li>Comunicar-nos com você sobre seus atendimentos</li>
          <li>Enviar informações relevantes sobre direitos do consumidor</li>
          <li>Melhorar nossos serviços e experiência do usuário</li>
          <li>Cumprir obrigações legais e regulatórias</li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          3. Compartilhamento de Dados
        </h3>
        <p className="text-muted-foreground mb-2">
          Não vendemos, alugamos ou compartilhamos suas informações pessoais com
          terceiros, exceto:
        </p>
        <ul className="text-muted-foreground ml-6 list-disc space-y-1">
          <li>
            Quando necessário para processar sua reclamação ou atendimento
          </li>
          <li>Quando exigido por lei ou ordem judicial</li>
          <li>
            Com prestadores de serviços que nos auxiliam (sob contrato de
            confidencialidade)
          </li>
          <li>
            Com autoridades competentes quando necessário para proteção do
            consumidor
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          4. Segurança dos Dados
        </h3>
        <p className="text-muted-foreground">
          Implementamos medidas técnicas e organizacionais adequadas para
          proteger suas informações pessoais contra acesso não autorizado,
          alteração, divulgação ou destruição. Utilizamos tecnologias de
          segurança padrão da indústria e limitamos o acesso às informações
          pessoais apenas a funcionários autorizados.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          5. Direitos do Usuário
        </h3>
        <p className="text-muted-foreground mb-2">
          De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei nº
          13.709/2018), você tem direito a:
        </p>
        <ul className="text-muted-foreground ml-6 list-disc space-y-1">
          <li>Confirmar a existência de tratamento de dados pessoais</li>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li>
            Solicitar anonimização, bloqueio ou eliminação de dados
            desnecessários
          </li>
          <li>Solicitar portabilidade dos dados</li>
          <li>Revogar consentimento</li>
          <li>Obter informações sobre compartilhamento de dados</li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          6. Cookies e Tecnologias Similares
        </h3>
        <p className="text-muted-foreground">
          Nosso site utiliza cookies e tecnologias similares para melhorar sua
          experiência de navegação, analisar o tráfego do site e personalizar
          conteúdo. Você pode gerenciar suas preferências de cookies através das
          configurações do seu navegador.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          7. Retenção de Dados
        </h3>
        <p className="text-muted-foreground">
          Mantemos suas informações pessoais apenas pelo tempo necessário para
          cumprir as finalidades para as quais foram coletadas, ou conforme
          exigido por lei. Após esse período, os dados serão eliminados ou
          anonimizados de forma segura.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          8. Alterações nesta Política
        </h3>
        <p className="text-muted-foreground">
          Podemos atualizar esta Política de Privacidade periodicamente. A data
          da última atualização será indicada no início do documento.
          Recomendamos que você revise esta política regularmente para se manter
          informado sobre como protegemos suas informações.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          9. Contato para Questões de Privacidade
        </h3>
        <p className="text-muted-foreground mb-2">
          Para exercer seus direitos ou esclarecer dúvidas sobre esta Política
          de Privacidade, entre em contato conosco:
        </p>
        <div className="text-muted-foreground space-y-1">
          <p>
            <strong>E-mail:</strong> proconitumbiara@gmail.com
          </p>
          <p>
            <strong>Telefone:</strong> (64) 3432-1215
          </p>
          <p>
            <strong>Endereço:</strong> Av. Porto Nacional, 495 - CEP: 75528-122
            - Itumbiara/GO
          </p>
          <p>
            <strong>Horário de Atendimento:</strong> Segunda a Sexta, 7h às 13h
          </p>
        </div>
      </section>

      <section>
        <p className="text-muted-foreground text-xs italic">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          1. Aceitação dos Termos
        </h3>
        <p className="text-muted-foreground">
          Ao acessar e utilizar o site do Procon Itumbiara, você concorda em
          cumprir e estar vinculado a estes Termos de Uso. Se você não concorda
          com qualquer parte destes termos, não deve utilizar nosso site. O uso
          continuado do site após alterações nestes termos constitui aceitação
          das mesmas.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          2. Uso do Site
        </h3>
        <p className="text-muted-foreground mb-2">
          Você concorda em utilizar o site apenas para fins legais e de acordo
          com estes Termos de Uso. É proibido:
        </p>
        <ul className="text-muted-foreground ml-6 list-disc space-y-1">
          <li>
            Utilizar o site de forma que viole qualquer lei ou regulamento
          </li>
          <li>Enviar informações falsas, enganosas ou fraudulentas</li>
          <li>Tentar obter acesso não autorizado a qualquer parte do site</li>
          <li>Interferir ou interromper o funcionamento do site</li>
          <li>Transmitir vírus, malware ou código malicioso</li>
          <li>Coletar informações de outros usuários sem autorização</li>
          <li>Utilizar o site para fins comerciais não autorizados</li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          3. Propriedade Intelectual
        </h3>
        <p className="text-muted-foreground">
          Todo o conteúdo do site, incluindo textos, gráficos, logotipos,
          ícones, imagens, áudios, downloads digitais e compilações de dados, é
          propriedade do Procon Itumbiara ou de seus fornecedores de conteúdo e
          está protegido por leis de direitos autorais brasileiras e
          internacionais. Você não pode reproduzir, distribuir, modificar, criar
          trabalhos derivados, exibir publicamente ou usar comercialmente
          qualquer conteúdo do site sem autorização prévia por escrito.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          4. Informações Fornecidas pelo Usuário
        </h3>
        <p className="text-muted-foreground">
          Ao fornecer informações através de formulários, reclamações ou
          comunicações, você declara que as informações são verdadeiras,
          precisas e completas. Você é responsável por manter a
          confidencialidade de suas credenciais de acesso, se aplicável, e por
          todas as atividades que ocorram sob sua conta.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          5. Links para Sites de Terceiros
        </h3>
        <p className="text-muted-foreground">
          Nosso site pode conter links para sites de terceiros que não são
          controlados pelo Procon Itumbiara. Não temos controle sobre o
          conteúdo, políticas de privacidade ou práticas de sites de terceiros e
          não assumimos responsabilidade por eles. Ao clicar em links para sites
          de terceiros, você o faz por sua conta e risco.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          6. Limitação de Responsabilidade
        </h3>
        <p className="text-muted-foreground">
          O Procon Itumbiara se esforça para fornecer informações precisas e
          atualizadas, mas não garante que o conteúdo do site esteja livre de
          erros, seja completo ou atualizado. O site é fornecido &quot;como
          está&quot;, sem garantias de qualquer tipo, expressas ou implícitas.
          Não nos responsabilizamos por danos diretos, indiretos, incidentais ou
          consequenciais resultantes do uso ou incapacidade de usar o site.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          7. Disponibilidade do Site
        </h3>
        <p className="text-muted-foreground">
          Não garantimos que o site estará disponível de forma ininterrupta ou
          livre de erros. Podemos interromper o acesso ao site para manutenção,
          atualizações ou por outras razões técnicas, sem aviso prévio. Não nos
          responsabilizamos por qualquer perda ou dano resultante da
          indisponibilidade do site.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          8. Modificações dos Termos
        </h3>
        <p className="text-muted-foreground">
          Reservamo-nos o direito de modificar estes Termos de Uso a qualquer
          momento, sem aviso prévio. As alterações entrarão em vigor
          imediatamente após sua publicação no site. É sua responsabilidade
          revisar periodicamente estes termos para estar ciente de quaisquer
          alterações.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          9. Lei Aplicável e Jurisdição
        </h3>
        <p className="text-muted-foreground">
          Estes Termos de Uso são regidos pelas leis da República Federativa do
          Brasil. Qualquer disputa relacionada a estes termos ou ao uso do site
          será resolvida nos tribunais competentes da cidade de Itumbiara,
          Estado de Goiás.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          10. Contato
        </h3>
        <p className="text-muted-foreground mb-2">
          Se você tiver dúvidas sobre estes Termos de Uso, entre em contato
          conosco:
        </p>
        <div className="text-muted-foreground space-y-1">
          <p>
            <strong>E-mail:</strong> proconitumbiara@gmail.com
          </p>
          <p>
            <strong>Telefone:</strong> (64) 3432-1215
          </p>
          <p>
            <strong>Endereço:</strong> Av. Porto Nacional, 495 - CEP: 75528-122
            - Itumbiara/GO
          </p>
          <p>
            <strong>Horário de Atendimento:</strong> Segunda a Sexta, 7h às 13h
          </p>
        </div>
      </section>

      <section>
        <p className="text-muted-foreground text-xs italic">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </section>
    </div>
  );
}

function AccessibilityContent() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-muted-foreground">
          O Procon Itumbiara está comprometido em tornar seu site acessível a
          todas as pessoas, independentemente de suas habilidades ou limitações.
          Implementamos diversas funcionalidades e seguimos padrões de
          acessibilidade para garantir uma experiência inclusiva.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          Mecanismos de Acessibilidade Disponíveis
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              1. Alto Contraste
            </h4>
            <p className="text-muted-foreground">
              O site oferece um modo de alto contraste que aumenta a
              diferenciação entre elementos visuais, facilitando a leitura para
              usuários com baixa visão ou sensibilidade à luz. Você pode ativar
              ou desativar o alto contraste através do painel de acessibilidade
              localizado no lado direito da tela.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              2. Fonte Grande
            </h4>
            <p className="text-muted-foreground">
              Disponibilizamos a opção de aumentar o tamanho da fonte em todo o
              site, facilitando a leitura para usuários com dificuldades
              visuais. Esta funcionalidade pode ser ativada através do painel de
              acessibilidade.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              3. Navegação por Teclado
            </h4>
            <p className="text-muted-foreground">
              Todo o site pode ser navegado utilizando apenas o teclado, sem a
              necessidade de mouse. Utilize a tecla Tab para navegar entre
              elementos interativos, Enter ou Espaço para ativar botões e links,
              e Esc para fechar diálogos e menus.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              4. Estrutura Semântica HTML
            </h4>
            <p className="text-muted-foreground">
              Utilizamos elementos HTML semânticos (como header, nav, main,
              section, article, footer) para estruturar o conteúdo de forma
              lógica e significativa, facilitando a compreensão por leitores de
              tela e outras tecnologias assistivas.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              5. Atributos ARIA
            </h4>
            <p className="text-muted-foreground">
              Implementamos atributos ARIA (Accessible Rich Internet
              Applications) para fornecer informações adicionais sobre elementos
              interativos, estados e propriedades, melhorando a experiência para
              usuários de leitores de tela.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              6. Textos Alternativos em Imagens
            </h4>
            <p className="text-muted-foreground">
              Todas as imagens do site possuem textos alternativos descritivos,
              permitindo que usuários de leitores de tela compreendam o conteúdo
              visual.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              7. Contraste de Cores
            </h4>
            <p className="text-muted-foreground">
              Mantemos níveis adequados de contraste entre texto e fundo em todo
              o site, atendendo aos padrões WCAG (Web Content Accessibility
              Guidelines) para garantir legibilidade.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              8. Foco Visível
            </h4>
            <p className="text-muted-foreground">
              Todos os elementos interativos possuem indicadores de foco
              visíveis, facilitando a navegação por teclado e indicando
              claramente qual elemento está ativo.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              9. Links e Botões Descritivos
            </h4>
            <p className="text-muted-foreground">
              Utilizamos textos descritivos em links e botões, evitando termos
              genéricos como &quot;clique aqui&quot;, para que o contexto seja
              claro mesmo quando lido fora do contexto.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              10. CDC Acessível
            </h4>
            <p className="text-muted-foreground mb-2">
              Disponibilizamos acesso ao Código de Defesa do Consumidor em
              formato acessível, incluindo versão em Libras. Você pode acessar
              através do painel de acessibilidade ou pelo link direto:
            </p>
            <p className="text-muted-foreground">
              <a
                href="http://www.pcdlegal.com.br/cdc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary focus:ring-primary hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                CDC Acessível (abre em nova aba)
              </a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          Painel de Acessibilidade
        </h3>
        <p className="text-muted-foreground">
          O painel de acessibilidade está localizado no lado direito da tela e
          pode ser acessado a qualquer momento. Através dele, você pode ativar
          ou desativar o alto contraste e a fonte grande, além de acessar o CDC
          Acessível. O painel é totalmente navegável por teclado e compatível
          com leitores de tela.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          Conformidade com Padrões
        </h3>
        <p className="text-muted-foreground">
          Nosso site busca estar em conformidade com as Diretrizes de
          Acessibilidade para Conteúdo Web (WCAG) 2.1, nível AA, e com a Lei
          Brasileira de Inclusão (Lei nº 13.146/2015). Continuamente trabalhamos
          para melhorar a acessibilidade e a experiência de todos os usuários.
        </p>
      </section>

      <section>
        <h3 className="text-foreground mb-3 text-base font-semibold">
          Feedback e Sugestões
        </h3>
        <p className="text-muted-foreground mb-2">
          Se você encontrar alguma barreira de acessibilidade ou tiver sugestões
          para melhorias, entre em contato conosco:
        </p>
        <div className="text-muted-foreground space-y-1">
          <p>
            <strong>E-mail:</strong> proconitumbiara@gmail.com
          </p>
          <p>
            <strong>Telefone:</strong> (64) 3432-1215
          </p>
          <p>
            <strong>Endereço:</strong> Av. Porto Nacional, 495 - CEP: 75528-122
            - Itumbiara/GO
          </p>
          <p>
            <strong>Horário de Atendimento:</strong> Segunda a Sexta, 7h às 13h
          </p>
        </div>
      </section>
    </div>
  );
}
