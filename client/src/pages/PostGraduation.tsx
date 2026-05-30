import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, GraduationCap, Clock, Award, BookOpen } from "lucide-react";

// Dados dos cursos de pós-graduação organizados por áreas
const posGraduacaoData = {
  areas: [
    {
      id: "administracao-gestao",
      nome: "Administração e Gestão",
      icon: "📊",
      cursos: [
        "Administração de banco de dados",
        "Administração financeira, inovação digital e fintechs",
        "Administração Hospitalar e Gestão de pessoas",
        "Administração hospitalar, legislação e auditoria",
        "Administração Industrial",
        "Administração para Engenheiros"
      ]
    },
    {
      id: "direito-advocacia",
      nome: "Direito e Advocacia",
      icon: "⚖️",
      cursos: [
        "Advocacia 4.0, Inovação Jurídica e Tecnológica",
        "Direito Administrativo",
        "Direito administrativo contemporâneo",
        "Direito Ambiental",
        "Direito civil",
        "Direito civil contemporâneo",
        "Direito constitucional",
        "Direito constitucional contemporâneo",
        "Direito Contratual",
        "Direito de família e das sucessões",
        "Direito digital aplicado",
        "Direito do Trabalho e Previdenciário",
        "Direito do trabalho e previdenciário aplicado",
        "Direito do trabalho e processo do trabalho",
        "Direito do Trabalho e Processo do Trabalho Contemporâneo",
        "Direito e Governança Socioambiental",
        "Direito e Tecnologia",
        "Direito Imobiliário Aplicado",
        "Direito notarial e registral",
        "Direito penal e processo penal",
        "Direito penal e processo penal contemporâneo",
        "Direito previdenciário: teoria e prática",
        "Direito processual civil",
        "Direito processual civil contemporâneo",
        "Direito público",
        "Direito público contemporâneo",
        "Direito tributário"
      ]
    },
    {
      id: "educacao",
      nome: "Educação",
      icon: "📚",
      cursos: [
        "Africanidades e Cultura Afro-Brasileira",
        "Alfabetização e Letramento",
        "Alfabetização e Letramento de Crianças, Jovens e Adultos",
        "Alimentação Escolar",
        "Andragogia e Formação de Adultos",
        "Arte Educação",
        "Artes na Educação Infantil",
        "Atendimento Educacional Especializado e Educação Especial",
        "Competências Socioemocionais na Escola",
        "Currículo e Avaliação Escolar",
        "Docência e Gestão na Educação Básica",
        "Docência em Engenharia",
        "Docência em Saúde",
        "Docência em sistemas de informação",
        "Docência na Educação Profissional e Ensino Técnico",
        "Docência no Ensino Superior",
        "Docência Virtual",
        "EAD e as Tecnologias Educacionais",
        "Educação Ambiental",
        "Educação Bilíngue",
        "Educação com Ênfase nos Ensinos Fundamental II e Médio",
        "Educação Continuada e Permanente em Saúde",
        "Educação Corporativa e Gestão do Conhecimento",
        "Educação de Jovens e Adultos",
        "Educação Especial",
        "Educação Especial com Ênfase em Atendimento Educacional Especializado (AEE)",
        "Educação Especial com ênfase em Comunicação Alternativa",
        "Educação Especial com ênfase em Deficiência Auditiva",
        "Educação Especial com ênfase em Deficiência Física",
        "Educação Especial com Ênfase em Deficiência Física e Motora - Mobilidade e Acessibilidade",
        "Educação Especial com ênfase em Deficiência Intelectual",
        "Educação Especial com Ênfase em Psicomotricidade",
        "Educação Especial com ênfase em Transtornos Globais do Desenvolvimento",
        "Educação Especial com Foco na Tecnologia Assistiva e Comunicação Alternativa e Ampliada (CAA)",
        "Educação Especial e Inclusiva",
        "Educação Especial e Inclusiva com Ênfase em Deficiência Intelectual",
        "Educação Especial e Psicomotricidade",
        "Educação Especial na Perspectiva da Educação Bilíngue-LIBRAS-LP",
        "Educação Especial na Perspectiva Inclusiva",
        "Educação Física Adaptada com Foco em Educação Especial e Inclusão",
        "Educação Física e Psicomotricidade"
      ]
    },
    {
      id: "tecnologia-ti",
      nome: "Tecnologia e TI",
      icon: "💻",
      cursos: [
        "Algoritmos e Lógica de Programação",
        "Análise de Dados",
        "Análise e Desenvolvimento de Sistemas",
        "Análise, Projeto e Gerência de Sistemas",
        "Animação Digital",
        "Aplicações Móveis com Ênfase em aplicativos e Jogos",
        "Aprendizagem Criativa e Pensamento Computacional",
        "Arquitetura de Software",
        "Arquitetura de Soluções",
        "Arquitetura e Gestão da Infraestrutura em TI",
        "Business Intelligence, Big Data e Analytics - Ciência de Dados",
        "Cidades Inteligentes: Tecnologia e Inovação",
        "Cloud Computing",
        "Computação Forense e Perícia Digital",
        "Data center e computação em nuvem",
        "Data Protection Officer - DPO",
        "Desenvolvimento back end",
        "Desenvolvimento de Aplicações Mobile",
        "Desenvolvimento de Games",
        "Desenvolvimento Front End",
        "Desenvolvimento humano em gestão de projetos",
        "Desenvolvimento Web Full-Stack",
        "DevOps"
      ]
    },
    {
      id: "design",
      nome: "Design",
      icon: "🎨",
      cursos: [
        "Design de Interiores",
        "Design de produtos digitais – UX-UI",
        "Design Educacional",
        "Design Gráfico",
        "Design Instrucional",
        "Design Thinking",
        "Design Thinking e Criatividade nas Organizações",
        "Direção de Arte"
      ]
    },
    {
      id: "arquitetura-engenharia",
      nome: "Arquitetura e Engenharia",
      icon: "🏗️",
      cursos: [
        "Arquitetura e Cidades",
        "Arquitetura paisagística",
        "Arquitetura Sustentável",
        "Automação industrial e robótica",
        "Automação, controle e robótica na indústria",
        "BIM e Projetos Aplicados à Construção Civil",
        "Construção civil enxuta",
        "Edificações sustentáveis"
      ]
    },
    {
      id: "saude",
      nome: "Saúde",
      icon: "🏥",
      cursos: [
        "Análises Clínicas",
        "Assistência Social e Saúde Pública",
        "Auditoria em enfermagem",
        "Auditoria, Perícia e Licenciamento Ambiental"
      ]
    },
    {
      id: "agricultura-meio-ambiente",
      nome: "Agricultura e Meio Ambiente",
      icon: "🌱",
      cursos: [
        "Agricultura de Precisão",
        "Agricultura Sustentável",
        "Biotecnologia",
        "Defesa Civil",
        "Direito e Governança Socioambiental"
      ]
    },
    {
      id: "negocios-financas",
      nome: "Negócios e Finanças",
      icon: "💼",
      cursos: [
        "Análise financeira e estratégia empresarial",
        "Avaliação Estratégica de Investimentos e Gestão Financeira",
        "Comércio exterior e marketing internacional",
        "Comércio exterior e negócios internacionais",
        "Compliance contratual",
        "Compliance e Gestão de Riscos",
        "Contabilidade com ênfase em Tributos",
        "Contabilidade Pública",
        "Contabilidade, Perícia e Auditoria",
        "E-commerce de Moda",
        "Economia Criativa"
      ]
    },
    {
      id: "comunicacao-marketing",
      nome: "Comunicação e Marketing",
      icon: "📱",
      cursos: [
        "Comunicação e Oratória",
        "Comunicação Organizacional",
        "Comunicação Pessoal como Ferramenta de Gestão",
        "Comunicação, Publicidade e Marketing em Mídias Digitais",
        "Criação publicitária",
        "Criminologia"
      ]
    }
  ]
};

export default function PostGraduation() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Calcular total de cursos
  const totalCursos = posGraduacaoData.areas.reduce((acc, area) => acc + area.cursos.length, 0);

  // Filtrar cursos por busca
  const filteredAreas = posGraduacaoData.areas.map(area => ({
    ...area,
    cursos: area.cursos.filter(curso =>
      curso.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(area => area.cursos.length > 0);

  // Área selecionada ou todas as áreas se não houver seleção
  const areasToShow = selectedArea
    ? filteredAreas.filter(area => area.id === selectedArea)
    : filteredAreas;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>Pós-Graduação Lato Sensu EaD</span>
            </div>
            
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl leading-tight mb-6">
              Especialize-se com <span className="text-secondary">Pós-Graduação EaD</span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed mb-8 max-w-3xl mx-auto">
              Mais de {totalCursos} cursos de pós-graduação em 10 áreas do conhecimento. Estude 100% online com certificação reconhecida pelo MEC.
            </p>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-secondary mb-2">{totalCursos}+</div>
                <div className="text-sm text-blue-100">Cursos Disponíveis</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-secondary mb-2">100%</div>
                <div className="text-sm text-blue-100">Online</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-secondary mb-2">MEC</div>
                <div className="text-sm text-blue-100">Reconhecido</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Busca e Filtros */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Barra de Busca */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar curso de pós-graduação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg rounded-full border-2 focus:border-primary"
              />
            </div>

            {/* Filtros por Área */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={selectedArea === null ? "default" : "outline"}
                onClick={() => setSelectedArea(null)}
                className="rounded-full"
              >
                Todas as Áreas
              </Button>
              {posGraduacaoData.areas.map((area) => (
                <Button
                  key={area.id}
                  variant={selectedArea === area.id ? "default" : "outline"}
                  onClick={() => setSelectedArea(area.id)}
                  className="rounded-full"
                >
                  <span className="mr-2">{area.icon}</span>
                  {area.nome}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Cursos por Área */}
      <section className="py-16 bg-white">
        <div className="container">
          {areasToShow.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Nenhum curso encontrado</h3>
              <p className="text-muted-foreground">Tente buscar com outros termos ou selecione outra área.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {areasToShow.map((area) => (
                <div key={area.id} className="scroll-mt-24" id={area.id}>
                  {/* Cabeçalho da Área */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="text-5xl">{area.icon}</div>
                    <div>
                      <h2 className="font-heading font-bold text-3xl text-primary">
                        {area.nome}
                      </h2>
                      <p className="text-muted-foreground">
                        {area.cursos.length} {area.cursos.length === 1 ? 'curso disponível' : 'cursos disponíveis'}
                      </p>
                    </div>
                  </div>

                  {/* Grid de Cursos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {area.cursos.map((curso, index) => (
                      <div
                        key={index}
                        className="group bg-white border-2 border-border hover:border-primary rounded-2xl p-6 transition-all hover:shadow-xl hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <GraduationCap className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-3 leading-snug">
                              {curso}
                            </h3>
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>6-12 meses</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                <span>Certificado MEC</span>
                              </div>
                            </div>
                            <a
                              href="https://wa.me/5594992435333?text=Olá%2C%20gostaria%20de%20informações%20sobre%20pós-graduação"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" className="w-full rounded-full">
                                Saiba Mais
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container relative z-10 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6">
            Pronto para se especializar?
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            Entre em contato conosco e descubra como a pós-graduação pode impulsionar sua carreira profissional.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://wa.me/5594992435333?text=Olá%2C%20gostaria%20de%20informações%20sobre%20pós-graduação"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg px-10 h-14 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
