import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import ScrollReveal from "@/components/ScrollReveal";

const Terms = () => {
  return (
    <>
      <SEOHead
        title="Termos de Uso | Byoma Research"
        description="Termos de Uso do Byoma Research. Conheça as regras e condições para utilização do nosso site e conteúdo."
        url="/termos"
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-6 py-24">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                Termos de Uso
              </h1>
              
              <p className="text-muted-foreground mb-8">
                Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
                  <p className="text-muted-foreground mb-4">
                    Ao acessar e usar o site Byoma Research (byomaresearch.com), você concorda em cumprir e estar 
                    vinculado a estes Termos de Uso. Se você não concordar com alguma parte destes termos, não 
                    deverá usar nosso site.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
                  <p className="text-muted-foreground mb-4">
                    O Byoma Research é um portal de conteúdo especializado em finanças sustentáveis, crédito de 
                    carbono, tokenização verde, economia regenerativa e temas relacionados ao mercado verde. 
                    Oferecemos:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Artigos e análises sobre o mercado de sustentabilidade</li>
                    <li>Guias educacionais sobre crédito de carbono e tokenização</li>
                    <li>Newsletter com insights e tendências do setor</li>
                    <li>Conteúdo informativo sobre finanças verdes e ESG</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Uso do Conteúdo</h2>
                  <p className="text-muted-foreground mb-4">
                    Todo o conteúdo publicado no Byoma Research é protegido por direitos autorais. Você pode:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Ler e compartilhar nosso conteúdo para fins pessoais e não comerciais</li>
                    <li>Citar trechos com devida atribuição e link para a fonte original</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">Você NÃO pode:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Reproduzir, distribuir ou republicar conteúdo sem autorização escrita</li>
                    <li>Usar nosso conteúdo para fins comerciais sem permissão</li>
                    <li>Modificar, adaptar ou criar trabalhos derivados sem autorização</li>
                    <li>Remover avisos de direitos autorais ou marcas</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Isenção de Responsabilidade</h2>
                  <p className="text-muted-foreground mb-4">
                    <strong>IMPORTANTE:</strong> O conteúdo do Byoma Research é apenas informativo e educacional. 
                    NÃO constitui aconselhamento financeiro, jurídico, tributário ou de investimento.
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Não nos responsabilizamos por decisões tomadas com base em nosso conteúdo</li>
                    <li>Recomendamos consultar profissionais qualificados antes de qualquer decisão de investimento</li>
                    <li>Não garantimos a precisão, completude ou atualidade das informações</li>
                    <li>O mercado de créditos de carbono e ativos digitais envolve riscos significativos</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cadastro e Newsletter</h2>
                  <p className="text-muted-foreground mb-4">
                    Ao se inscrever em nossa newsletter, você:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Concorda em receber comunicações por e-mail</li>
                    <li>Garante que as informações fornecidas são verdadeiras</li>
                    <li>Pode cancelar a inscrição a qualquer momento através do link em nossos e-mails</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Conduta do Usuário</h2>
                  <p className="text-muted-foreground mb-4">Ao usar nosso site, você concorda em:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Não violar leis ou regulamentos aplicáveis</li>
                    <li>Não transmitir vírus, malware ou código malicioso</li>
                    <li>Não tentar acessar áreas restritas do site sem autorização</li>
                    <li>Não usar robôs, scrapers ou métodos automatizados para coleta de dados</li>
                    <li>Não sobrecarregar nossos servidores ou interferir no funcionamento do site</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Links Externos</h2>
                  <p className="text-muted-foreground mb-4">
                    Nosso site pode conter links para sites de terceiros. Não temos controle sobre esses sites 
                    e não nos responsabilizamos por seu conteúdo, políticas de privacidade ou práticas. 
                    O uso de links externos é por sua conta e risco.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Propriedade Intelectual</h2>
                  <p className="text-muted-foreground mb-4">
                    Todos os direitos de propriedade intelectual do site, incluindo mas não limitado a:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Textos, artigos e conteúdo editorial</li>
                    <li>Design, layout e elementos gráficos</li>
                    <li>Logotipos e marcas registradas</li>
                    <li>Software e código fonte</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    São de propriedade exclusiva do Byoma Research ou de seus licenciadores.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitação de Responsabilidade</h2>
                  <p className="text-muted-foreground mb-4">
                    Na extensão máxima permitida por lei, o Byoma Research não será responsável por:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Danos diretos, indiretos, incidentais ou consequenciais</li>
                    <li>Perda de lucros, dados ou oportunidades de negócio</li>
                    <li>Interrupções ou erros no serviço</li>
                    <li>Ações de terceiros ou conteúdo de sites externos</li>
                  </ul>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Modificações dos Termos</h2>
                  <p className="text-muted-foreground mb-4">
                    Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações 
                    entrarão em vigor imediatamente após a publicação no site. O uso continuado do site após 
                    modificações constitui aceitação dos novos termos.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">11. Lei Aplicável e Foro</h2>
                  <p className="text-muted-foreground mb-4">
                    Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer 
                    disputa será submetida ao foro da comarca de São Paulo, SP, com exclusão de qualquer outro.
                  </p>
                </section>
                
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contato</h2>
                  <p className="text-muted-foreground mb-4">
                    Para dúvidas sobre estes Termos de Uso, entre em contato:
                  </p>
                  <ul className="list-none text-muted-foreground space-y-2">
                    <li><strong>E-mail:</strong> contato@byomaresearch.com</li>
                    <li><strong>Página de contato:</strong> <a href="/contato" className="text-primary hover:underline">byomaresearch.com/contato</a></li>
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

export default Terms;