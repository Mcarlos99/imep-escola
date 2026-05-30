import { ExternalLink, GraduationCap, Star } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function ProfessionalCourses() {
  const categories = [
    {
      name: "Indústria",
      description: "Cursos voltados para o setor industrial e manufatura",
      icon: "🏭",
      color: "bg-blue-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#industria"
    },
    {
      name: "Idiomas",
      description: "Aprenda novos idiomas com cursos práticos e dinâmicos",
      icon: "🌍",
      color: "bg-green-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#idiomas"
    },
    {
      name: "Marketing",
      description: "Estratégias de marketing digital e comunicação",
      icon: "📱",
      color: "bg-pink-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#marketing"
    },
    {
      name: "Educação",
      description: "Cursos para profissionais da área educacional",
      icon: "📚",
      color: "bg-yellow-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#educacao"
    },
    {
      name: "Tecnologia",
      description: "Programação, redes e desenvolvimento de sistemas",
      icon: "💻",
      color: "bg-purple-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#tecnologia"
    },
    {
      name: "Comércio",
      description: "Gestão comercial, vendas e atendimento ao cliente",
      icon: "🛒",
      color: "bg-orange-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#comercio"
    },
    {
      name: "Estética",
      description: "Beleza, cuidados pessoais e bem-estar",
      icon: "💄",
      color: "bg-rose-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#estetica"
    },
    {
      name: "Administração",
      description: "Gestão empresarial, finanças e recursos humanos",
      icon: "📊",
      color: "bg-indigo-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#administracao"
    },
    {
      name: "Saúde",
      description: "Cursos da área da saúde e cuidados médicos",
      icon: "🏥",
      color: "bg-red-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#saude"
    },
    {
      name: "Saúde Animal",
      description: "Cuidados veterinários e bem-estar animal",
      icon: "🐾",
      color: "bg-teal-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#saude-animal"
    },
    {
      name: "Teologia",
      description: "Estudos religiosos e formação teológica",
      icon: "✝️",
      color: "bg-amber-500",
      url: "https://cursosmagalhaeseduca.com.br/ead/#teologia"
    }
  ];

  const topCourses = [
    "Introdução a Informática",
    "Powerpoint 2019",
    "Windows 11",
    "Word 2019",
    "Excel 2019",
    "Excel 2016 Avançado",
    "Internet",
    "Mídias Sociais",
    "Elaboração de Currículo",
    "Normas da ABNT"
  ];

  const benefits = [
    {
      icon: "🎮",
      title: "Plataforma Gamificada",
      description: "Aprenda de forma divertida e motivadora"
    },
    {
      icon: "📜",
      title: "Certificado Profissional",
      description: "Reconhecido em todo o Brasil"
    },
    {
      icon: "🏠",
      title: "Estude em Casa",
      description: "Qualquer dispositivo, qualquer hora"
    },
    {
      icon: "💰",
      title: "Preço Acessível",
      description: "Cursos completos que cabem no seu bolso"
    },
    {
      icon: "👨‍🏫",
      title: "Suporte Individual",
      description: "Tire suas dúvidas durante o curso"
    },
    {
      icon: "🎯",
      title: "Aprendizado Garantido",
      description: "Aulas objetivas e detalhadas"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container relative z-10 py-20">
          <div className="max-w-3xl text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-secondary font-semibold text-sm">
              <GraduationCap className="w-4 h-4" />
              <span>Cursos 100% Online</span>
            </div>
            
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl leading-tight">
              Cursos <span className="text-secondary">Profissionalizantes</span> Online
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl">
              Aprenda novas habilidades com cursos práticos e certificados reconhecidos. Do nível básico ao avançado, estude no seu ritmo e conquiste seu espaço no mercado de trabalho.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="https://cursosmagalhaeseduca.com.br/ead/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg px-8 h-14 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  Acessar Plataforma
                  <ExternalLink className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Vantagens</span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Por que escolher nossos cursos profissionalizantes?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="font-heading font-bold text-xl text-primary mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Categorias</span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
              Explore Nossas <span className="text-secondary">Áreas de Conhecimento</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Escolha a categoria que mais se encaixa com seus objetivos profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, idx) => (
              <a
                key={idx}
                href={category.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`${category.color} p-8 text-white h-full min-h-[200px] flex flex-col justify-between`}>
                  <div>
                    <div className="text-6xl mb-4">{category.icon}</div>
                    <h3 className="font-heading font-bold text-2xl mb-2">{category.name}</h3>
                    <p className="text-white/90 text-sm">{category.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 text-white/90 group-hover:text-white transition-colors">
                    <span className="text-sm font-semibold">Ver cursos</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Top Courses Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Mais Procurados</span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
              Top 10 Cursos Mais Estudados
            </h2>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-4">
              {topCourses.map((course, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary">{course}</h4>
                  </div>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container relative z-10 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6">
            Pronto para começar sua jornada de aprendizado?
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            Acesse nossa plataforma de cursos profissionalizantes e comece a estudar hoje mesmo!
          </p>
          <a href="https://cursosmagalhaeseduca.com.br/ead/" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg px-10 h-14 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Acessar Plataforma EAD
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>
    </Layout>
  );
}
