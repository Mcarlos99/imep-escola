import { Heart, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Favorites() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Buscar favoritos do usuário
  const { data: favorites, isLoading, refetch } = trpc.admin.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutation para remover favorito
  const removeFavoriteMutation = trpc.admin.favorites.toggle.useMutation({
    onSuccess: () => {
      toast.success("Curso removido dos favoritos");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao remover favorito");
    }
  });

  const handleRemoveFavorite = (courseId: number) => {
    removeFavoriteMutation.mutate({ courseId });
  };

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

  // Redirecionar para login se não autenticado
  if (!authLoading && !isAuthenticated) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-4">
              Faça login para ver seus favoritos
            </h1>
            <p className="text-muted-foreground mb-8">
              Entre na sua conta para acessar sua lista de desejos e gerenciar seus cursos favoritos.
            </p>
            <a href={getLoginUrl()}>
              <Button className="bg-primary hover:bg-primary/90">
                Fazer Login
              </Button>
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const favoriteCourses = favorites?.filter(f => f.course) || [];

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary text-white py-16">
        <div className="container">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <Heart className="w-8 h-8 fill-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl">Minha Lista de Desejos</h1>
              <p className="text-blue-100 mt-2">
                {favoriteCourses.length} {favoriteCourses.length === 1 ? 'curso salvo' : 'cursos salvos'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          {favoriteCourses.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                Sua lista está vazia
              </h2>
              <p className="text-muted-foreground mb-8">
                Explore nossos cursos e adicione seus favoritos clicando no ícone de coração.
              </p>
              <Link href="/cursos">
                <Button className="bg-primary hover:bg-primary/90">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Explorar Cursos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteCourses.map((favorite) => {
                const course = favorite.course;
                if (!course) return null;

                return (
                  <div key={favorite.id} className="neumorphic-card overflow-hidden flex flex-col">
                    <div className="relative h-48 overflow-hidden group">
                      <img 
                        src={course.image || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/zamNRObOqQZhCYxN.jpg"} 
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Botão de remover */}
                      <button
                        onClick={() => handleRemoveFavorite(course.id)}
                        disabled={removeFavoriteMutation.isPending}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50"
                        aria-label="Remover dos favoritos"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-heading font-bold text-xl text-primary mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      {course.shortDescription && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                          {course.shortDescription}
                        </p>
                      )}

                      <div className="space-y-2 mb-4 text-sm">
                        {course.duration && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duração:</span>
                            <span className="font-semibold">{course.duration}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Modalidade:</span>
                          <span className="font-semibold">{formatModality(course.modality)}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Mensalidades a partir de</p>
                            <p className="text-2xl font-bold text-primary">{formatPrice(course.price)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/curso/${course.slug}`} className="flex-1">
                            <Button className="w-full bg-primary hover:bg-primary/90">
                              Ver Detalhes
                            </Button>
                          </Link>
                          <a 
                            href={`https://wa.me/5594992435333?text=${encodeURIComponent(`Olá, gostaria de mais informações sobre o curso ${course.title}!`)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button className="w-full bg-secondary hover:bg-secondary/90">
                              Matricular
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {favoriteCourses.length > 0 && (
        <section className="py-16 bg-primary text-white text-center">
          <div className="container">
            <h2 className="font-heading font-bold text-3xl mb-4">
              Pronto para dar o próximo passo?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              Entre em contato conosco e tire suas dúvidas sobre os cursos que você salvou.
            </p>
            <a 
              href="https://wa.me/5594992435333?text=Olá, gostaria de informações sobre os cursos!"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold px-10 h-14 rounded-full">
                Falar com Consultor
              </Button>
            </a>
          </div>
        </section>
      )}
    </Layout>
  );
}
