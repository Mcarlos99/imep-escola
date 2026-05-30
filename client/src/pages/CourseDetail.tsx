import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, Calendar, Award, Users, BookOpen, CheckCircle2, Loader2, MessageCircle, CreditCard, PlayCircle, GraduationCap } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import PreEnrollmentForm from "@/components/PreEnrollmentForm";

export default function CourseDetail() {
  const params = useParams();
  const slug = params.slug;

  // Buscar curso pelo slug
  const { data: course, isLoading, error } = trpc.courses.getBySlug.useQuery(
    { slug: slug || "" },
    { 
      enabled: !!slug,
      retry: false // Não tentar novamente se o curso não for encontrado
    }
  );

  // Buscar categoria do curso
  const { data: category } = trpc.categories.getById.useQuery(
    { id: course?.categoryId || 0 },
    { enabled: !!course?.categoryId }
  );

  // Buscar grade curricular do curso
  const { data: curriculumItems } = trpc.curriculum.getByCourse.useQuery(
    { courseId: course?.id || 0 },
    { enabled: !!course?.id }
  );

  const formatPrice = (price: string | number | null) => {
    if (!price) return "R$ 199,00";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  const formatModality = (modality: string) => {
    switch (modality) {
      case 'presencial': return 'Presencial';
      case 'ead': return 'EAD - 100% Online';
      case 'hibrido': return 'Híbrido';
      default: return modality;
    }
  };

  // Converter URL de vídeo para embed
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return null;
  };

  const whatsappMessage = course 
    ? `Olá, gostaria de mais informações sobre o curso ${course.title}!`
    : "Olá, gostaria de mais informações sobre os cursos!";
  
  const whatsappLink = `https://wa.me/5594992435333?text=${encodeURIComponent(whatsappMessage)}`;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-4">
              Curso não encontrado
            </h1>
            <p className="text-muted-foreground mb-8">
              O curso que você está procurando não existe ou foi removido.
            </p>
            <Link href="/cursos">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver todos os cursos
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={course.image || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/ufYQRnDbPmxJFTzN.jpg"} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70" />
        
        <div className="container relative z-10 py-16">
          <Link href="/cursos">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para cursos
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-2/3 space-y-6">
              {category && (
                <Badge className="bg-secondary hover:bg-secondary text-white border-none">
                  {category.name}
                </Badge>
              )}
              
              <h1 className="font-heading font-bold text-4xl md:text-5xl leading-tight">
                {course.title}
              </h1>
              
              {course.shortDescription && (
                <p className="text-xl text-blue-100 leading-relaxed">
                  {course.shortDescription}
                </p>
              )}
              
              <div className="flex flex-wrap gap-6 pt-4">
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Duração</p>
                      <p className="font-semibold">{course.duration}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Modalidade</p>
                    <p className="font-semibold">{formatModality(course.modality)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Certificação</p>
                    <p className="font-semibold">Reconhecido pelo MEC</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card de Preço */}
            <div className="lg:w-1/3 w-full">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-foreground">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Mensalidades a partir de</p>
                  {course.originalPrice && parseFloat(course.originalPrice) > parseFloat(course.price || "0") && (
                    <p className="text-lg text-muted-foreground line-through">
                      {formatPrice(course.originalPrice)}
                    </p>
                  )}
                  <p className="text-4xl font-bold text-primary">
                    {formatPrice(course.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">/mês</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {[
                    "Material didático incluso",
                    "Certificado reconhecido pelo MEC",
                    "Professores especialistas",
                    "Suporte ao aluno"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                
                <EnrollButton courseId={course.id} courseName={course.title} />
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Pagamento seguro via Stripe
                </p>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center mb-2">Ou fale conosco</p>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Sobre o Curso */}
            {course.description && (
              <section>
                <h2 className="font-heading font-bold text-2xl text-primary mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-secondary" />
                  Sobre o Curso
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  <p className="whitespace-pre-line">{course.description}</p>
                </div>
              </section>
            )}

            {/* Vídeo do Curso */}
            {course.videoUrl && getEmbedUrl(course.videoUrl) && (
              <section>
                <h2 className="font-heading font-bold text-2xl text-primary mb-6 flex items-center gap-3">
                  <PlayCircle className="w-6 h-6 text-secondary" />
                  Conheça o Curso
                </h2>
                <div className="rounded-2xl overflow-hidden shadow-xl bg-black">
                  <div className="relative" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={getEmbedUrl(course.videoUrl) || ''}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Vídeo do curso ${course.title}`}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Grade Curricular */}
            {curriculumItems && curriculumItems.length > 0 && (
              <section>
                <h2 className="font-heading font-bold text-2xl text-primary mb-6 flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                  Grade Curricular
                </h2>
                <div className="space-y-4">
                  {curriculumItems.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="bg-white border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-heading font-bold text-lg text-foreground">
                              {item.title}
                            </h3>
                            {item.duration && (
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {item.duration}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Diferenciais */}
            <section>
              <h2 className="font-heading font-bold text-2xl text-primary mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-secondary" />
                Diferenciais do IMEP
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: "Professores Especialistas",
                    desc: "Corpo docente formado por profissionais atuantes no mercado"
                  },
                  {
                    icon: <BookOpen className="w-6 h-6" />,
                    title: "Metodologia Prática",
                    desc: "Aprenda fazendo em laboratórios modernos e equipados"
                  },
                  {
                    icon: <Award className="w-6 h-6" />,
                    title: "Certificação MEC",
                    desc: "Diploma válido em todo território nacional"
                  },
                  {
                    icon: <CheckCircle2 className="w-6 h-6" />,
                    title: "Alta Empregabilidade",
                    desc: "98% dos nossos alunos estão empregados na área"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Imagem do Curso */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={course.image || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/zamNRObOqQZhCYxN.jpg"} 
                alt={course.title}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Informações Rápidas */}
            <div className="bg-muted/30 rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg text-primary mb-4">Informações do Curso</h3>
              <div className="space-y-4">
                {course.duration && (
                  <div className="flex justify-between items-center pb-3 border-b border-border/50">
                    <span className="text-muted-foreground">Duração</span>
                    <span className="font-semibold">{course.duration}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Modalidade</span>
                  <span className="font-semibold">{formatModality(course.modality)}</span>
                </div>
                {category && (
                  <div className="flex justify-between items-center pb-3 border-b border-border/50">
                    <span className="text-muted-foreground">Área</span>
                    <span className="font-semibold">{category.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Certificação</span>
                  <span className="font-semibold text-green-600">MEC</span>
                </div>
              </div>
            </div>

            {/* CTA Secundário */}
            <div className="bg-primary rounded-2xl p-6 text-white text-center">
              <h3 className="font-heading font-bold text-lg mb-2">Tem dúvidas?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Nossa equipe está pronta para ajudar você a escolher o melhor caminho.
              </p>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full">
                  Falar com Consultor
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <section className="py-16 bg-secondary">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">
            Pronto para transformar sua carreira?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Garanta sua vaga no curso de {course.title} e dê o primeiro passo rumo ao sucesso profissional.
          </p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-white text-secondary hover:bg-white/90 font-bold px-10 h-14 rounded-full shadow-xl">
              Matricule-se Agora
            </Button>
          </a>
        </div>
      </section>
    </Layout>
  );
}

// Componente de botão de matrícula
function EnrollButton({ courseId, courseName }: { courseId: number; courseName: string }) {
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreEnrollment, setShowPreEnrollment] = useState(false);
  
  const createCheckoutMutation = trpc.admin.payments.createCheckout.useMutation({
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        toast.success("Redirecionando para o pagamento...");
        window.open(data.checkoutUrl, "_blank");
      }
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao processar matrícula");
      setIsProcessing(false);
    },
  });
  
  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast.info("Faça login para se matricular");
      window.location.href = getLoginUrl();
      return;
    }
    
    setIsProcessing(true);
    createCheckoutMutation.mutate({ courseId });
  };
  
  return (
    <>
      <Button 
        onClick={() => setShowPreEnrollment(true)}
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-14 rounded-full shadow-lg mb-3"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        Pré-Matrícula Gratuita
      </Button>
      
      <Button 
        onClick={handleEnroll}
        disabled={isProcessing}
        variant="outline"
        className="w-full border-2 border-secondary text-secondary hover:bg-secondary/10 font-bold h-14 rounded-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pagar Agora
          </>
        )}
      </Button>
      
      <PreEnrollmentForm 
        courseId={courseId}
        courseName={courseName}
        open={showPreEnrollment}
        onOpenChange={setShowPreEnrollment}
      />
    </>
  );
}
