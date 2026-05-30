import AdminLayout from "@/components/AdminLayout";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CourseFormData = {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: number;
  duration: string;
  modality: "presencial" | "ead" | "hibrido";
  price: string;
  originalPrice: string;
  image: string;
  videoUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
};

const defaultFormData: CourseFormData = {
  title: "",
  slug: "",
  description: "",
  shortDescription: "",
  categoryId: 0,
  duration: "",
  modality: "presencial",
  price: "",
  originalPrice: "",
  image: "",
  videoUrl: "",
  isActive: true,
  isFeatured: false,
  order: 0,
};

export default function CoursesAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(defaultFormData);

  const utils = trpc.useUtils();
  const { data: courses, isLoading } = trpc.admin.courses.list.useQuery();
  const { data: categories } = trpc.admin.categories.list.useQuery();

  const createMutation = trpc.admin.courses.create.useMutation({
    onSuccess: () => {
      toast.success("Curso criado com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.courses.list.invalidate();
      utils.courses.list.invalidate();
      utils.courses.featured.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar curso: " + error.message);
    },
  });

  const updateMutation = trpc.admin.courses.update.useMutation({
    onSuccess: () => {
      toast.success("Curso atualizado com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.courses.list.invalidate();
      utils.courses.list.invalidate();
      utils.courses.featured.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar curso: " + error.message);
    },
  });

  const deleteMutation = trpc.admin.courses.delete.useMutation({
    onSuccess: () => {
      toast.success("Curso excluído com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.courses.list.invalidate();
      utils.courses.list.invalidate();
      utils.courses.featured.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao excluir curso: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
  };

  const handleEdit = (course: NonNullable<typeof courses>[number]) => {
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      shortDescription: course.shortDescription || "",
      categoryId: course.categoryId,
      duration: course.duration || "",
      modality: course.modality,
      price: course.price || "",
      originalPrice: course.originalPrice || "",
      image: course.image || "",
      videoUrl: course.videoUrl || "",
      isActive: course.isActive,
      isFeatured: course.isFeatured,
      order: course.order || 0,
    });
    setEditingId(course.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug) {
      toast.error("Preencha o título e slug");
      return;
    }
    
    if (!formData.categoryId || formData.categoryId === 0) {
      toast.error("Selecione uma categoria para o curso");
      return;
    }

    // Validar URL de vídeo se fornecida
    if (formData.videoUrl) {
      const youtubePattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
      const vimeoPattern = /vimeo\.com\/(\d+)/;
      
      if (!youtubePattern.test(formData.videoUrl) && !vimeoPattern.test(formData.videoUrl)) {
        toast.error("URL de vídeo inválida. Use um link do YouTube ou Vimeo.");
        return;
      }
    }

    // Limpar campos vazios antes de enviar
    const cleanData: any = {};
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof CourseFormData];
      // Incluir apenas valores não vazios (exceto booleanos e números)
      if (value !== "" && value !== null && value !== undefined) {
        cleanData[key] = value;
      }
    });

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: cleanData });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este curso?")) {
      deleteMutation.mutate({ id });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Cursos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os cursos oferecidos pelo IMEP
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Curso" : "Novo Curso"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize as informações do curso" : "Preencha as informações do novo curso"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Imagem do Curso</Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url || "" })}
                    folder="courses"
                    aspectRatio="video"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 800x450px (proporção 16:9)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          title: e.target.value,
                          slug: generateSlug(e.target.value)
                        });
                      }}
                      placeholder="Ex: Técnico em Enfermagem"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="tecnico-em-enfermagem"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Categoria *</Label>
                    <Select
                      value={formData.categoryId ? formData.categoryId.toString() : ""}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modality">Modalidade *</Label>
                    <Select
                      value={formData.modality}
                      onValueChange={(value: "presencial" | "ead" | "hibrido") => setFormData({ ...formData, modality: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="ead">EAD</SelectItem>
                        <SelectItem value="hibrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descrição Curta</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Breve descrição do curso"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição detalhada do curso"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">URL do Vídeo (YouTube ou Vimeo)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole o link completo do vídeo do YouTube ou Vimeo
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Ex: 18 meses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="299.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                    <Input
                      id="originalPrice"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="399.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Ordem</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Ativo</Label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                    />
                    <Label htmlFor="isFeatured">Destaque</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Cursos</CardTitle>
            <CardDescription>
              {courses?.length ?? 0} curso(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {course.image ? (
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-20 h-14 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-20 h-14 bg-muted rounded-lg flex items-center justify-center border">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.modality === "presencial" ? "Presencial" : 
                           course.modality === "ead" ? "EAD" : "Híbrido"} • {course.duration}
                          {course.price && ` • R$ ${course.price}`}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {course.isFeatured && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                              Destaque
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${course.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {course.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(course)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum curso cadastrado ainda.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar primeiro curso
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
