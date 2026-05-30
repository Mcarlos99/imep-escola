import { useState, useMemo } from "react";
import { Search, Filter, Loader2, BookOpen, DollarSign, Clock, Video, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import CourseCard from "@/components/ui/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [durationRange, setDurationRange] = useState<string | null>(null);
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  
  // Buscar categorias do banco de dados
  const { data: categoriesData, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  
  // Buscar cursos do banco de dados
  const { data: coursesData, isLoading: coursesLoading } = trpc.courses.list.useQuery();

  // Criar mapa de categorias para lookup rápido
  const categoryMap = useMemo(() => {
    if (!categoriesData) return {};
    return categoriesData.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<number, string>);
  }, [categoriesData]);

  // Filtrar cursos por categoria, busca, preço, duração e vídeo
  const filteredCourses = useMemo(() => {
    if (!coursesData) return [];
    
    return coursesData.filter(course => {
      // Filtro de categoria
      const matchesCategory = activeCategory === null || course.categoryId === activeCategory;
      
      // Filtro de busca
      const matchesSearch = searchTerm === "" || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro de faixa de preço
      let matchesPrice = true;
      if (priceRange && course.price) {
        const price = typeof course.price === 'string' ? parseFloat(course.price) : course.price;
        switch (priceRange) {
          case 'under-200':
            matchesPrice = price < 200;
            break;
          case '200-400':
            matchesPrice = price >= 200 && price <= 400;
            break;
          case 'over-400':
            matchesPrice = price > 400;
            break;
        }
      }
      
      // Filtro de duração
      let matchesDuration = true;
      if (durationRange && course.duration) {
        const durationMatch = course.duration.match(/(\d+)/);
        if (durationMatch) {
          const months = parseInt(durationMatch[1]);
          switch (durationRange) {
            case 'under-12':
              matchesDuration = months < 12;
              break;
            case '12-18':
              matchesDuration = months >= 12 && months <= 18;
              break;
            case '18-24':
              matchesDuration = months >= 18 && months <= 24;
              break;
            case 'over-24':
              matchesDuration = months > 24;
              break;
          }
        }
      }
      
      // Filtro de vídeo
      const matchesVideo = !hasVideo || (course.videoUrl !== null && course.videoUrl !== '');
      
      return matchesCategory && matchesSearch && matchesPrice && matchesDuration && matchesVideo;
    });
  }, [coursesData, activeCategory, searchTerm, priceRange, durationRange, hasVideo]);

  const formatPrice = (price: string | number | null) => {
    if (!price) return "Consulte";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  const formatModality = (modality: string) => {
    switch (modality) {
      case 'presencial': return 'Presencial';
      case 'ead': return 'EAD';
      case 'hibrido': return 'Híbrido';
      default: return modality;
    }
  };

  const isLoading = categoriesLoading || coursesLoading;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary py-16 text-white">
        <div className="container text-center">
          <h1 className="font-heading font-bold text-4xl mb-4">Nossos Cursos</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Explore nosso catálogo completo de cursos técnicos e encontre a formação ideal para o seu futuro profissional.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-6 ${
                activeCategory === null 
                  ? "bg-secondary hover:bg-secondary/90 text-white border-secondary" 
                  : "border-border hover:border-secondary hover:text-secondary"
              }`}
            >
              Todos
            </Button>
            {categoriesData && categoriesData.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-6 ${
                  activeCategory === cat.id 
                    ? "bg-secondary hover:bg-secondary/90 text-white border-secondary" 
                    : "border-border hover:border-secondary hover:text-secondary"
                }`}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar curso..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full border-border focus:border-secondary focus:ring-secondary"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-muted/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg text-foreground">Filtros Avançados</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtro de Preço */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-secondary" />
                <Label className="font-semibold text-foreground">Faixa de Preço</Label>
              </div>
              <div className="space-y-2">
                <Button
                  variant={priceRange === 'under-200' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriceRange(priceRange === 'under-200' ? null : 'under-200')}
                  className={`w-full justify-start ${
                    priceRange === 'under-200'
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'hover:border-secondary hover:text-secondary'
                  }`}
                >
                  Até R$ 200
                </Button>
                <Button
                  variant={priceRange === '200-400' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriceRange(priceRange === '200-400' ? null : '200-400')}
                  className={`w-full justify-start ${
                    priceRange === '200-400'
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'hover:border-secondary hover:text-secondary'
                  }`}
                >
                  R$ 200 - R$ 400
                </Button>
                <Button
                  variant={priceRange === 'over-400' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriceRange(priceRange === 'over-400' ? null : 'over-400')}
                  className={`w-full justify-start ${
                    priceRange === 'over-400'
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'hover:border-secondary hover:text-secondary'
                  }`}
                >
                  Acima de R$ 400
                </Button>
              </div>
            </div>

            {/* Filtro de Duração */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-secondary" />
                <Label className="font-semibold text-foreground">Duração</Label>
              </div>
              <div className="space-y-2">
                <Button
                  variant={durationRange === 'under-12' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDurationRange(durationRange === 'under-12' ? null : 'under-12')}
                  className={`w-full justify-start ${
                    durationRange === 'under-12'
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'hover:border-secondary hover:text-secondary'
                  }`}
                >
                  Até 12 meses
                </Button>
                <Button
                  variant={durationRange === '12-18' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDurationRange(durationRange === '12-18' ? null : '12-18')}
                  className={`w-full justify-start ${
                    durationRange === '12-18'
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'hover:border-secondary hover:text-secondary'
                  }`}
                >
                  12 - 18 meses
                </Button>
                <Button
                  variant={durationRange === '18-24' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDurationRange(durationRange === '18-24' ? null : '18-24')}
                  className={`w-full justify-start ${
                    durationRange === '18-24'
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'hover:border-secondary hover:text-secondary'
                  }`}
                >
                  18 - 24 meses
                </Button>
                <Button
                  variant={durationRange === 'over-24' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDurationRange(durationRange === 'over-24' ? null : 'over-24')}
                  className={`w-full justify-start ${
                    durationRange === 'over-24'
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'hover:border-secondary hover:text-secondary'
                  }`}
                >
                  Acima de 24 meses
                </Button>
              </div>
            </div>

            {/* Filtro de Vídeo */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-secondary" />
                <Label className="font-semibold text-foreground">Recursos</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:border-secondary transition-colors">
                <Checkbox 
                  id="has-video" 
                  checked={hasVideo}
                  onCheckedChange={(checked) => setHasVideo(checked as boolean)}
                />
                <Label 
                  htmlFor="has-video" 
                  className="cursor-pointer text-sm font-normal"
                >
                  Apenas cursos com vídeo
                </Label>
              </div>
              
              {/* Botão Limpar Filtros */}
              {(priceRange || durationRange || hasVideo) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPriceRange(null);
                    setDurationRange(null);
                    setHasVideo(false);
                  }}
                  className="w-full mt-4 border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros Avançados
                </Button>
              )}
            </div>
          </div>
          
          {/* Contador de Resultados */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-semibold text-foreground">{filteredCourses.length}</span> {filteredCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id}
                id={course.id}
                slug={course.slug}
                title={course.title}
                category={categoryMap[course.categoryId] || "Geral"}
                duration={course.duration || ""}
                modality={formatModality(course.modality)}
                image={course.image || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663139677222/zamNRObOqQZhCYxN.jpg"}
                price={formatPrice(course.price)}
                shortDescription={course.shortDescription || undefined}
              />
            ))}
          </div>
        )}

        {/* Empty State - Nenhum curso cadastrado */}
        {!isLoading && coursesData && coursesData.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-foreground mb-3">Em breve, nossos cursos</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Estamos preparando os melhores cursos técnicos para você. Entre em contato para saber mais sobre as próximas turmas!
            </p>
            <a href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20cursos!" target="_blank" rel="noopener noreferrer">
              <Button className="bg-secondary hover:bg-secondary/90">
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        )}

        {/* Empty State - Filtro sem resultados */}
        {!isLoading && filteredCourses.length === 0 && coursesData && coursesData.length > 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar seus filtros ou busca.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setActiveCategory(null);
                setSearchTerm("");
                setPriceRange(null);
                setDurationRange(null);
                setHasVideo(false);
              }}
            >
              Limpar todos os filtros
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
