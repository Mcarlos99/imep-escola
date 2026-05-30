import Layout from "@/components/layout/Layout";
import { CheckCircle2, Target, Heart, Zap } from "lucide-react";

export default function About() {
  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container relative z-10 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">Sobre o IMEP</h1>
          <p className="text-blue-100 max-w-3xl mx-auto text-lg">
            Há mais de 15 anos formando profissionais qualificados e transformando vidas através da educação técnica de excelência.
          </p>
        </div>
      </div>

      {/* History Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary rounded-full opacity-20 blur-2xl"></div>
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/ufYQRnDbPmxJFTzN.jpg" 
                  alt="Fachada do IMEP" 
                  className="rounded-2xl shadow-2xl relative z-10 w-full"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-full opacity-20 blur-2xl"></div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <span className="text-secondary font-bold tracking-wider uppercase text-sm">Nossa História</span>
              <h2 className="font-heading font-bold text-3xl text-primary">Tradição e Inovação no Ensino Técnico</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Instituto Magalhães de Educação Profissional (IMEP) nasceu do sonho de oferecer educação técnica de alta qualidade acessível a todos. Fundado em 2008, começamos com apenas dois cursos e uma pequena turma de alunos determinados.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hoje, somos referência em ensino profissionalizante na região, com mais de 20 cursos técnicos autorizados pelo MEC, laboratórios de última geração e milhares de alunos formados e atuando no mercado de trabalho.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nossa metodologia une a teoria sólida com a prática intensiva, garantindo que nossos alunos saiam preparados para enfrentar os desafios reais de suas profissões desde o primeiro dia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="neumorphic-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-primary mb-4">Missão</h3>
              <p className="text-muted-foreground">
                Promover a educação profissional de excelência, formando cidadãos competentes, éticos e preparados para transformar o mercado de trabalho e a sociedade.
              </p>
            </div>

            <div className="neumorphic-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-primary mb-4">Visão</h3>
              <p className="text-muted-foreground">
                Ser reconhecida nacionalmente como referência em inovação e qualidade no ensino técnico, sendo a primeira escolha de quem busca qualificação profissional.
              </p>
            </div>

            <div className="neumorphic-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-primary mb-4">Valores</h3>
              <p className="text-muted-foreground">
                Ética, Transparência, Inovação, Respeito à Diversidade, Compromisso com o Aluno e Responsabilidade Social.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-wider uppercase text-sm">Estrutura</span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mt-2">
              Ambiente pensado para o seu aprendizado
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="flex gap-6">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/CmriqaxKtUllFqMJ.jpg" 
                  alt="Laboratório de Enfermagem" 
                  className="w-1/2 h-48 object-cover rounded-2xl shadow-md hover:scale-105 transition-transform duration-500"
                />
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/VECuZPFFjrufKoXZ.jpg" 
                  alt="Laboratório de Informática" 
                  className="w-1/2 h-48 object-cover rounded-2xl shadow-md hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex gap-6">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/gBWvWZukrdUWTMFg.jpg" 
                  alt="Sala de Aula" 
                  className="w-1/2 h-48 object-cover rounded-2xl shadow-md hover:scale-105 transition-transform duration-500"
                />
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/zamNRObOqQZhCYxN.jpg" 
                  alt="Laboratório Técnico" 
                  className="w-1/2 h-48 object-cover rounded-2xl shadow-md hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6 lg:pl-10">
              <h3 className="font-heading font-bold text-2xl text-primary">Infraestrutura Completa</h3>
              <p className="text-muted-foreground">
                Investimos constantemente em nossa estrutura para garantir que você tenha acesso ao que há de mais moderno em sua área de atuação.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Laboratórios de Enfermagem com bonecos realistas",
                  "Laboratórios de Informática com computadores de alta performance",
                  "Oficinas de Elétrica e Mecânica equipadas",
                  "Biblioteca com acervo físico e digital atualizado",
                  "Salas de aula climatizadas e com recursos multimídia",
                  "Áreas de convivência e cantina"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
