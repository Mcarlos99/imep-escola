import AdminLayout from "@/components/AdminLayout";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Star, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TestimonialFormData = {
  name: string;
  course: string;
  content: string;
  image: string;
  rating: number;
  isActive: boolean;
  order: number;
};

const defaultFormData: TestimonialFormData = {
  name: "",
  course: "",
  content: "",
  image: "",
  rating: 5,
  isActive: true,
  order: 0,
};

export default function TestimonialsAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(defaultFormData);

  const utils = trpc.useUtils();
  const { data: testimonials, isLoading } = trpc.admin.testimonials.list.useQuery();

  const createMutation = trpc.admin.testimonials.create.useMutation({
    onSuccess: () => {
      toast.success("Depoimento criado com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.testimonials.list.invalidate();
      utils.testimonials.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar depoimento: " + error.message);
    },
  });

  const updateMutation = trpc.admin.testimonials.update.useMutation({
    onSuccess: () => {
      toast.success("Depoimento atualizado com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.testimonials.list.invalidate();
      utils.testimonials.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar depoimento: " + error.message);
    },
  });

  const deleteMutation = trpc.admin.testimonials.delete.useMutation({
    onSuccess: () => {
      toast.success("Depoimento excluído com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.testimonials.list.invalidate();
      utils.testimonials.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao excluir depoimento: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
  };

  const handleEdit = (testimonial: NonNullable<typeof testimonials>[number]) => {
    setFormData({
      name: testimonial.name,
      course: testimonial.course || "",
      content: testimonial.content,
      image: testimonial.image || "",
      rating: testimonial.rating || 5,
      isActive: testimonial.isActive,
      order: testimonial.order || 0,
    });
    setEditingId(testimonial.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.content) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este depoimento?")) {
      deleteMutation.mutate({ id });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Depoimentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os depoimentos de alunos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Depoimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Depoimento" : "Novo Depoimento"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize as informações do depoimento" : "Preencha as informações do novo depoimento"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Foto do Aluno</Label>
                  <div className="flex items-start gap-4">
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url || "" })}
                      folder="testimonials"
                      aspectRatio="square"
                      className="w-24"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Foto quadrada recomendada (200x200px)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Aluno *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Maria Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Curso</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="Ex: Técnico em Enfermagem"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Depoimento *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="O que o aluno disse sobre o IMEP..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Avaliação</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 cursor-pointer transition-colors ${
                              star <= formData.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Ordem</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Depoimento ativo</Label>
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
            <CardTitle>Lista de Depoimentos</CardTitle>
            <CardDescription>
              {testimonials?.length ?? 0} depoimento(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : testimonials && testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((testimonial) => (
                  <div 
                    key={testimonial.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {testimonial.image ? (
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{testimonial.name}</h3>
                            {testimonial.course && (
                              <p className="text-sm text-muted-foreground">{testimonial.course}</p>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${testimonial.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {testimonial.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <div className="flex gap-0.5 mt-1">
                          {renderStars(testimonial.rating || 5)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                          "{testimonial.content}"
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(testimonial)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(testimonial.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum depoimento cadastrado ainda.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar primeiro depoimento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
