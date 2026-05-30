import { Clock, Calendar, ChevronRight, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";

interface CourseCardProps {
  id?: number;
  slug?: string;
  title: string;
  category: string;
  duration: string;
  modality: string;
  image: string;
  price?: string;
  shortDescription?: string;
  videoUrl?: string | null;
}

export default function CourseCard({ id, slug, title, category, duration, modality, image, price, shortDescription, videoUrl }: CourseCardProps) {
  const courseLink = slug ? `/curso/${slug}` : id ? `/curso/${id}` : "#";
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Verificar se o curso está favoritado
  const { data: favoriteStatus } = trpc.admin.favorites.check.useQuery(
    { courseId: id || 0 },
    { enabled: isAuthenticated && !!id }
  );

  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorited(favoriteStatus.isFavorited);
    }
  }, [favoriteStatus]);

  // Mutation para toggle favorito
  const toggleFavoriteMutation = trpc.admin.favorites.toggle.useMutation({
    onSuccess: (data) => {
      setIsFavorited(data.isFavorited);
      toast.success(data.isFavorited ? "Curso adicionado aos favoritos!" : "Curso removido dos favoritos");
    },
    onError: () => {
      toast.error("Erro ao atualizar favoritos");
    }
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Faça login para favoritar cursos", {
        action: {
          label: "Fazer Login",
          onClick: () => window.location.href = getLoginUrl()
        }
      });
      return;
    }

    if (!id) {
      toast.error("ID do curso não encontrado");
      return;
    }

    toggleFavoriteMutation.mutate({ courseId: id });
  };
  
  return (
    <div className="group neumorphic-card overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-2">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={image || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/zamNRObOqQZhCYxN.jpg"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge className="absolute top-4 left-4 z-20 bg-secondary hover:bg-secondary text-white border-none shadow-lg">
          {category}
        </Badge>
        
        {/* Indicador de Vídeo */}
        {videoUrl && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Com Vídeo</span>
          </div>
        )}
        
        {/* Botão de Favoritar */}
        <button
          onClick={handleFavoriteClick}
          disabled={toggleFavoriteMutation.isPending}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50"
          aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{duration}</span>
            </div>
          )}
          {modality && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{modality === 'presencial' ? 'Presencial' : modality === 'ead' ? 'EAD' : modality === 'hibrido' ? 'Híbrido' : modality}</span>
            </div>
          )}
        </div>
        
        <h3 className="font-heading font-bold text-xl text-primary mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-grow">
          {shortDescription || "Formação completa com certificação reconhecida pelo MEC. Prepare-se para atuar em uma das áreas que mais crescem no mercado."}
        </p>
        
        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Mensalidades a partir de</span>
            <span className="text-lg font-bold text-primary">{price || "R$ 199,00"}</span>
          </div>
          <Link href={courseLink}>
            <Button size="icon" className="rounded-full bg-primary hover:bg-secondary transition-colors shadow-md w-10 h-10">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
