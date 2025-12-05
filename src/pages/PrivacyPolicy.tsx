import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import ScrollReveal from "@/components/ScrollReveal";

const PrivacyPolicy = () => {
  return (
    <>
      <SEOHead
        title="Política de Privacidade | Amazonia Research"
        description="Política de Privacidade do Amazonia Research. Saiba como coletamos, usamos e protegemos seus dados pessoais."
        url="/privacidade"
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-6 py-24">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                Política de Privacidade
              </h1>
              
              <p className="text-muted-foreground mb-8">
                Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
                  <p className="text-muted-foreground mb-4">
                    A Amazonia Research ("nós", "nosso" ou "nossa") está comprometida em proteger sua privacidade. 
                    Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas 
                    informações quando você visita nosso site amazonia.news.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Informações que Coletamos</h2>
                  <p className="text-muted-foreground mb-4">Podemos coletar os seguintes tipos de informações:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Informações de identificação pessoal:</strong> nome, endereço de e-mail quando você se inscreve em nossa newsletter ou entra em contato conosco.</li>
                    <li><strong>Informações de uso:</strong> dados sobre como você interage com nosso site, incluindo páginas visitadas, tempo de permanência e cliques.</li>
                    <li><strong>Informações técnicas:</strong> endereço IP, tipo de navegador, dispositivo e sistema operacional.</li>
                    <li><strong>Cookies:</strong> utilizamos cookies para melhorar sua experiência de navegação.</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Como Usamos Suas Informações</h2>
                  <p className="text-muted-foreground mb-4">Utilizamos as informações coletadas para:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Fornecer e manter nossos serviços</li>
                    <li>Enviar newsletters e atualizações (quando você optar por recebê-las)</li>
                    <li>Responder a suas perguntas e solicitações</li>
                    <li>Melhorar nosso site e conteúdo</li>
                    <li>Analisar tendências de uso e personalizar sua experiência</li>
                    <li>Cumprir obrigações legais</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compartilhamento de Informações</h2>
                  <p className="text-muted-foreground mb-4">
                    Não vendemos suas informações pessoais. Podemos compartilhar dados com:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Provedores de serviços:</strong> empresas que nos ajudam a operar o site (hospedagem, análise, e-mail marketing).</li>
                    <li><strong>Requisitos legais:</strong> quando exigido por lei ou para proteger nossos direitos.</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cookies e Tecnologias Similares</h2>
                  <p className="text-muted-foreground mb-4">
                    Utilizamos cookies para coletar informações e melhorar nossos serviços. Você pode configurar 
                    seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades do site.
                  </p>
                  <p className="text-muted-foreground mb-4">Tipos de cookies que usamos:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Cookies essenciais:</strong> necessários para o funcionamento básico do site.</li>
                    <li><strong>Cookies de análise:</strong> nos ajudam a entender como os visitantes interagem com o site.</li>
                    <li><strong>Cookies de preferências:</strong> lembram suas escolhas e configurações.</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Seus Direitos (LGPD)</h2>
                  <p className="text-muted-foreground mb-4">
                    De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Confirmar a existência de tratamento de dados</li>
                    <li>Acessar seus dados pessoais</li>
                    <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                    <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                    <li>Revogar o consentimento a qualquer momento</li>
                    <li>Solicitar a portabilidade dos dados</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Segurança dos Dados</h2>
                  <p className="text-muted-foreground mb-4">
                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações 
                    contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método 
                    de transmissão pela Internet é 100% seguro.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Retenção de Dados</h2>
                  <p className="text-muted-foreground mb-4">
                    Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos 
                    descritos nesta política, a menos que um período de retenção mais longo seja exigido por lei.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Links para Sites de Terceiros</h2>
                  <p className="text-muted-foreground mb-4">
                    Nosso site pode conter links para outros sites. Não somos responsáveis pelas práticas de 
                    privacidade desses sites. Recomendamos que você leia as políticas de privacidade de 
                    qualquer site que visitar.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Alterações nesta Política</h2>
                  <p className="text-muted-foreground mb-4">
                    Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
                    quaisquer alterações publicando a nova política nesta página e atualizando a data de 
                    "última atualização".
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contato</h2>
                  <p className="text-muted-foreground mb-4">
                    Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos, 
                    entre em contato conosco:
                  </p>
                  <ul className="list-none text-muted-foreground space-y-2">
                    <li><strong>E-mail:</strong> contato@amazonia.news</li>
                    <li><strong>Página de contato:</strong> <a href="/contato" className="text-primary hover:underline">amazonia.news/contato</a></li>
                  </ul>
                </section>
              </div>
            </div>
          </ScrollReveal>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;