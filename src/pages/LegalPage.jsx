import React, { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const scrollToSection = (sectionId) => {
  if (!sectionId) return;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const highlightSections = [
  {
    id: 'terms',
    title: 'Termos de Uso',
    description: 'Regras que orientam o uso da plataforma EmpowerUp, garantindo uma comunidade justa, segura e colaborativa.',
  },
  {
    id: 'privacy',
    title: 'Política de Privacidade',
    description: 'Detalha como coletamos, utilizamos e protegemos os dados das nossas usuárias, em conformidade com a LGPD.',
  },
];

const LegalPage = ({ defaultSection = 'terms' }) => {
  const location = useLocation();
  const activeSection = useMemo(() => {
    const hash = location.hash?.replace('#', '');
    if (hash && highlightSections.some((item) => item.id === hash)) {
      return hash;
    }
    return defaultSection;
  }, [defaultSection, location.hash]);

  useEffect(() => {
    if (activeSection) {
      scrollToSection(activeSection);
    }
  }, [activeSection]);

  const terms = useMemo(() => ([
    {
      heading: '1. Aceitação dos Termos',
      content: [
        'Ao acessar e utilizar a plataforma EmpowerUp ("plataforma" ou "serviço"), a usuária declara estar ciente e de acordo com estes Termos de Uso e com a Política de Privacidade. Caso não concorde, não deverá utilizar a plataforma. O uso contínuo indica aceite integral.'
      ],
    },
    {
      heading: '2. Definições',
      content: [
        'Para fins destes Termos, aplicam-se as seguintes definições:'
      ],
      list: [
        '<strong>Plataforma</strong>: ambiente digital denominado EmpowerUp, composto por website e funcionalidades integradas.',
        '<strong>Usuária</strong>: pessoa física ou jurídica que acessa e utiliza a plataforma, seja para consumir conteúdos, interagir na comunidade ou realizar transações no marketplace.',
        '<strong>Marketplace</strong>: funcionalidade destinada à divulgação e comercialização de produtos e serviços por meio da plataforma.'
      ],
    },
    {
      heading: '3. Elegibilidade',
      content: [
        'O uso da plataforma é permitido a pessoas maiores de 13 (treze) anos. Usuárias menores de 18 (dezoito) anos devem utilizá-la sob supervisão e autorização de seus responsáveis legais.'
      ],
    },
    {
      heading: '4. Funcionamento da Plataforma',
      content: [
        'A EmpowerUp disponibiliza às usuárias:'
      ],
      list: [
        'Conteúdos de capacitação e materiais exclusivos para assinantes dos planos pagos;',
        'Marketplace para divulgação e comercialização de produtos e serviços, com taxa de 5% sobre as vendas realizadas;',
        'Publicação de anúncios pagos, ao custo de R$ 20,00 por inserção;',
        'Publicidade digital, remunerada por cliques em anúncios patrocinados;',
        'Comunidade para interação social, compartilhamento de postagens e troca de informações entre usuárias.'
      ],
    },
    {
      heading: '5. Conduta na Plataforma',
      content: [
        'A usuária compromete-se a utilizar a plataforma de forma ética e responsável, abstendo-se de:'
      ],
      list: [
        'Publicar conteúdos ofensivos, ilegais, discriminatórios, difamatórios, falsos ou que violem direitos autorais e de propriedade intelectual;',
        'Realizar práticas de spam, fraude ou quaisquer condutas que comprometam a integridade da plataforma;',
        'Utilizar o marketplace para comercializar produtos ou serviços ilícitos ou em desacordo com a legislação vigente.'
      ],
      footer: 'O descumprimento dessas regras poderá resultar na suspensão ou exclusão da conta, a critério exclusivo da administração da EmpowerUp.'
    },
    {
      heading: '6. Responsabilidade pelo Conteúdo',
      content: [
        'Todo conteúdo publicado pelas usuárias, seja na comunidade ou no marketplace, é de responsabilidade exclusiva de seu autor. A EmpowerUp não se responsabiliza por informações falsas, imprecisas ou ofensivas e reserva-se o direito de remover conteúdos que violem estes Termos.'
      ],
    },
    {
      heading: '7. Propriedade Intelectual',
      content: [
        'Todos os elementos que compõem a plataforma, incluindo logotipos, design, códigos, textos e materiais exclusivos, são de propriedade da EmpowerUp, protegidos pela legislação de direitos autorais e de propriedade intelectual. A reprodução, cópia ou distribuição não autorizada é proibida.'
      ],
    },
    {
      heading: '8. Privacidade e Proteção de Dados',
      content: [
        'A coleta, armazenamento e tratamento dos dados pessoais ocorrerão conforme a Política de Privacidade da plataforma, em conformidade com a legislação brasileira, especialmente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).'
      ],
    },
    {
      heading: '9. Alterações nos Termos',
      content: [
        'A EmpowerUp poderá modificar estes Termos de Uso a qualquer momento. As alterações entram em vigor na data de sua publicação na plataforma. O uso contínuo após a atualização será considerado concordância com os novos termos.'
      ],
    },
    {
      heading: '10. Limitação de Responsabilidade',
      content: [
        'A plataforma é disponibilizada "tal como se encontra". A EmpowerUp não garante que os serviços serão ininterruptos ou livres de erros e não se responsabiliza por danos indiretos, lucros cessantes ou prejuízos decorrentes do uso da plataforma ou de falhas técnicas.'
      ],
    },
    {
      heading: '11. Encerramento e Suspensão de Conta',
      content: [
        'A EmpowerUp poderá suspender ou encerrar, a qualquer tempo, o acesso de usuárias que descumprirem estes Termos, sem necessidade de aviso prévio ou indenização.'
      ],
    },
    {
      heading: '12. Legislação Aplicável e Foro',
      content: [
        'Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca da sede administrativa da EmpowerUp para dirimir quaisquer controvérsias oriundas da utilização da plataforma.'
      ],
    },
    {
      heading: '13. Disposições Finais',
      content: [
        'Caso alguma das cláusulas destes Termos seja considerada inválida, as demais permanecerão em pleno vigor e efeito. Situações não previstas serão avaliadas pela equipe EmpowerUp, que poderá contatar a usuária para esclarecimentos.'
      ],
    }
  ]), []);

  const privacy = useMemo(() => ([
    {
      heading: '1. Disposições Gerais',
      content: [
        'Esta Política de Privacidade tem por finalidade informar, de forma clara e transparente, como a EmpowerUp realiza a coleta, o uso, o armazenamento, o compartilhamento e a proteção dos dados pessoais das usuárias, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
        'Ao utilizar a plataforma, a usuária declara estar ciente e de acordo com esta Política. Caso discorde, não deverá utilizar os serviços oferecidos.'
      ],
    },
    {
      heading: '2. Dados Coletados',
      content: ['A EmpowerUp poderá coletar as seguintes informações pessoais:'],
      list: [
        '<strong>Dados de cadastro</strong>: nome completo, e-mail, senha, telefone e demais informações necessárias à criação da conta;',
        '<strong>Dados de uso</strong>: interações na comunidade, histórico de postagens, grupos e eventos acessados;',
        '<strong>Dados financeiros</strong>: quando aplicável, informações de pagamento, faturamento e histórico de transações no marketplace;',
        '<strong>Dados técnicos</strong>: endereço IP, tipo de dispositivo, sistema operacional, navegador e registros de data e hora;',
        '<strong>Cookies e tecnologias similares</strong>: empregados para aprimorar a experiência da usuária e oferecer conteúdos personalizados.'
      ],
    },
    {
      heading: '3. Finalidade do Tratamento',
      content: ['Os dados pessoais são utilizados para:'],
      list: [
        'Permitir acesso e funcionamento adequado da plataforma;',
        'Gerenciar contas, autenticação e suporte técnico;',
        'Viabilizar transações e comunicações no marketplace;',
        'Enviar comunicações sobre atualizações, promoções e conteúdos relevantes (com opção de cancelamento a qualquer momento);',
        'Aprimorar serviços, personalizar a experiência e realizar análises estatísticas;',
        'Cumprir obrigações legais e regulatórias.'
      ],
    },
    {
      heading: '4. Compartilhamento de Dados',
      content: [
        'A EmpowerUp não comercializa dados pessoais das usuárias. O compartilhamento poderá ocorrer apenas:',
      ],
      list: [
        'Com parceiros de pagamento ou serviços essenciais ao funcionamento da plataforma;',
        'Com autoridades públicas, mediante requisição legal;',
        'Com prestadores de serviços que auxiliem em processos técnicos (como hospedagem ou segurança), sempre sob acordo de confidencialidade.'
      ],
    },
    {
      heading: '5. Armazenamento e Segurança',
      content: [
        'Os dados são armazenados em ambientes seguros, com medidas técnicas e administrativas para protegê-los contra acessos não autorizados, perdas, destruição ou alterações indevidas.',
        'Embora adote boas práticas de segurança, a EmpowerUp não pode garantir proteção absoluta contra ataques cibernéticos, comprometendo-se, porém, a agir prontamente em caso de incidentes.'
      ],
    },
    {
      heading: '6. Direitos da Usuária',
      content: ['Nos termos da LGPD, a usuária pode:'],
      list: [
        'Confirmar a existência de tratamento de seus dados;',
        'Solicitar acesso, correção, atualização ou exclusão de informações pessoais;',
        'Solicitar portabilidade dos dados a outro fornecedor de serviço;',
        'Revogar o consentimento para uso de dados, ciente de que isso pode limitar o uso da plataforma.'
      ],
      footer: 'As solicitações podem ser feitas pelos canais de contato oficiais disponíveis na plataforma.'
    },
    {
      heading: '7. Retenção dos Dados',
      content: [
        'Os dados pessoais serão mantidos pelo período necessário ao cumprimento das finalidades descritas nesta Política ou conforme exigido por lei. Após esse prazo, serão anonimizados ou excluídos de forma segura.'
      ],
    },
    {
      heading: '8. Uso de Cookies',
      content: [
        'Utilizamos cookies e tecnologias similares para reconhecer preferências, facilitar a navegação e oferecer conteúdos personalizados. A usuária pode gerenciar as permissões de cookies diretamente em seu navegador.'
      ],
    },
    {
      heading: '9. Atualizações desta Política',
      content: [
        'A EmpowerUp poderá atualizar esta Política de Privacidade a qualquer momento. As alterações entram em vigor na data de publicação. O uso contínuo será interpretado como concordância com as novas condições.'
      ],
    },
    {
      heading: '10. Contato e Dúvidas',
      content: [
        'Para esclarecimentos sobre esta Política ou solicitações relacionadas a dados pessoais, a usuária pode contatar a equipe EmpowerUp pelo e-mail informado na plataforma oficial.'
      ],
    },
    {
      heading: '11. Foro e Legislação Aplicável',
      content: [
        'Esta Política é regida pela legislação brasileira, especialmente pela Lei nº 13.709/2018 (LGPD). Fica eleito o foro da comarca da sede administrativa da EmpowerUp para dirimir quaisquer questões oriundas de sua interpretação ou execução.'
      ],
    }
  ]), []);

  return (
    <PageLayout
      title="Termos de Uso e Política de Privacidade"
      subtitle="Documento vigente a partir de 5 de outubro de 2025"
      breadcrumbs={[
        { label: 'Início', href: '/' },
        { label: 'Documentos legais' }
      ]}
    >
      <div className="space-y-12">
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Visão Geral</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Valorizamos a confiança da nossa comunidade. Nesta página você encontra as regras de uso da plataforma EmpowerUp e as diretrizes sobre como tratamos seus dados pessoais. Leia com atenção e, se tiver dúvidas, fale com a gente.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {highlightSections.map((section) => (
              <Button
                key={section.id}
                type="button"
                variant="outline"
                className={cn('justify-start border-gray-200 hover:border-coral hover:text-coral transition-colors', 'w-full sm:w-auto')}
                onClick={() => scrollToSection(section.id)}
              >
                {section.title}
              </Button>
            ))}
          </div>
        </section>

        {highlightSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm scroll-mt-24"
          >
            <header className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-coral">{section.title}</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {section.id === 'terms' ? 'Termos de Uso da Plataforma EmpowerUp' : 'Política de Privacidade EmpowerUp'}
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">{section.description}</p>
            </header>

            <div className="space-y-8">
              {(section.id === 'terms' ? terms : privacy).map((item, index) => (
                <article key={item.heading} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.heading}
                  </h3>
                  {item.content && item.content.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph }} />
                  ))}
                  {item.list && (
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {item.list.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} dangerouslySetInnerHTML={{ __html: bullet }} />
                      ))}
                    </ul>
                  )}
                  {item.footer && (
                    <p className="text-sm text-gray-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.footer }} />
                  )}

                  {index !== (section.id === 'terms' ? terms : privacy).length - 1 && (
                    <hr className="border-gray-100 mt-6" />
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="bg-gradient-to-r from-coral/10 via-white to-emerald-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Precisa falar com a gente?</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Estamos disponíveis para esclarecer qualquer dúvida sobre os Termos de Uso ou a Política de Privacidade. Envie uma mensagem pelo formulário de contato dentro da plataforma ou escreva para o e-mail oficial informado em nosso canal de suporte.
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default LegalPage;
