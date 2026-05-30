import { ArrowRight, CheckCircle2, GraduationCap, Users, Award, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import CourseCard from "@/components/ui/CourseCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import PartnerPolosMap from "@/components/PartnerPolosMap";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  // Buscar cursos em destaque do banco de dados
  const { data: featuredCourses, isLoading: coursesLoading } = trpc.courses.featured.useQuery();
  
  // Buscar depoimentos ativos do banco de dados
  const { data: testimonials, isLoading: testimonialsLoading } = trpc.testimonials.list.useQuery();

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/ufYQRnDbPmxJFTzN.jpg" 
            alt="IMEP Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
        </div>

        <div className="container relative z-10 py-20">
          <div className="max-w-2xl text-white space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-secondary font-semibold text-sm">
              <Award className="w-4 h-4" />
              <span>Matrículas Abertas 2026</span>
            </div>
            
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl leading-tight">
              Construa seu futuro com <span className="text-secondary">Educação Profissional</span> de Excelência
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-xl">
              No IMEP, unimos teoria e prática para formar os profissionais que o mercado procura. Cursos técnicos reconhecidos pelo MEC com infraestrutura moderna.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20minha%20matr%C3%ADcula%21" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg px-8 h-14 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  Quero me Matricular
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Link href="/cursos">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8 h-14 rounded-full backdrop-blur-sm">
                  Conhecer Cursos
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Stats Cards */}
        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 z-10 space-y-6">
          <div className="neumorphic-card bg-white/95 backdrop-blur p-6 w-64 animate-in slide-in-from-right-10 duration-700 delay-100 fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">+5.000</p>
                <p className="text-sm text-muted-foreground">Alunos Formados</p>
              </div>
            </div>
          </div>
          
          <div className="neumorphic-card bg-white/95 backdrop-blur p-6 w-64 ml-12 animate-in slide-in-from-right-10 duration-700 delay-200 fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-secondary">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">98%</p>
                <p className="text-sm text-muted-foreground">Empregabilidade</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-32 relative z-20">
            {[
              {
                icon: <Award className="w-8 h-8 text-white" />,
                title: "Reconhecido pelo MEC",
                desc: "Todos os nossos cursos possuem certificação válida em todo território nacional.",
                color: "bg-primary"
              },
              {
                icon: <BookOpen className="w-8 h-8 text-white" />,
                title: "Metodologia Prática",
                desc: "Aprenda fazendo em laboratórios modernos e equipados com tecnologia de ponta.",
                color: "bg-secondary"
              },
              {
                icon: <Users className="w-8 h-8 text-white" />,
                title: "Professores Especialistas",
                desc: "Corpo docente formado por profissionais atuantes e experientes no mercado.",
                color: "bg-primary"
              }
            ].map((feature, idx) => (
              <div key={idx} className={`${feature.color} p-8 rounded-2xl shadow-xl text-white hover:-translate-y-2 transition-transform duration-300`}>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section - Only shows if there are courses in database */}
      {coursesLoading ? (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </section>
      ) : featuredCourses && featuredCourses.length > 0 ? (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Nossos Cursos</span>
                <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
                  Escolha o caminho para o seu <span className="text-secondary">sucesso profissional</span>
                </h2>
              </div>
              <Link href="/cursos">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white gap-2">
                  Ver todos os cursos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCourses.slice(0, 4).map((course) => (
                <CourseCard 
                  key={course.id} 
                  id={course.id}
                  slug={course.slug}
                  title={course.title}
                  category={(course as any).categoryName || "Geral"}
                  duration={course.duration || ""}
                  modality={course.modality || ""}
                  image={course.image || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/zamNRObOqQZhCYxN.jpg"}
                  price={formatPrice(course.price || 0)}
                  videoUrl={course.videoUrl}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-heading font-bold text-2xl text-primary mb-2">
                Em breve, nossos cursos
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Estamos preparando os melhores cursos técnicos para você. Entre em contato para saber mais!
              </p>
              <a href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20cursos!" target="_blank" rel="noopener noreferrer">
                <Button className="bg-secondary hover:bg-secondary/90">
                  Falar no WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container">
            <div className="text-center mb-12">
              <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Depoimentos</span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
                O que nossos <span className="text-secondary">alunos dizem</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conheça as experiências de quem já transformou sua carreira com o IMEP
              </p>
            </div>

            <TestimonialsCarousel testimonials={testimonials} />

            <div className="text-center mt-12">
              <Link href="/depoimentos">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Ver Todos os Depoimentos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Partner Polos Map Section */}
      <PartnerPolosMap />

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/ufYQRnDbPmxJFTzN.jpg" alt="Estudantes IMEP" className="w-full h-auto" />
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white" />
                    ))}
                  </div>
                  <span className="font-bold text-primary">+2k Alunos</span>
                </div>
                <p className="text-sm text-muted-foreground">Junte-se a nossa comunidade de aprendizado e transforme sua carreira.</p>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-8">
              <div>
                <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Por que o IMEP?</span>
                <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-6">
                  Diferenciais que fazem a diferença na sua formação
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Não somos apenas uma escola técnica. Somos um centro de excelência focado em desenvolver as competências que o mercado de trabalho realmente valoriza.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  "Laboratórios equipados com tecnologia de última geração",
                  "Parcerias com grandes empresas para estágios",
                  "Material didático exclusivo e atualizado",
                  "Plataforma de ensino híbrido flexível",
                  "Apoio psicopedagógico e orientação de carreira"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center mt-1 group-hover:bg-secondary transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full shadow-lg mt-4">
                Agendar Visita
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container relative z-10 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            As inscrições para as turmas de 2026 já estão abertas. Garanta sua vaga com condições especiais de pagamento.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20minha%20matr%C3%ADcula%21" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg px-10 h-14 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                Inscreva-se Agora
              </Button>
            </a>
            <a href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20tenho%20d%C3%BAvidas%20sobre%20os%20cursos." target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-10 h-14 rounded-full">
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
