import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
};

const defaultFormData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  color: "#3b82f6",
  isActive: true,
};

export default function CategoriesAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.admin.categories.list.useQuery();

  const createMutation = trpc.admin.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.categories.list.invalidate();
      utils.categories.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar categoria: " + error.message);
    },
  });

  const updateMutation = trpc.admin.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.categories.list.invalidate();
      utils.categories.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar categoria: " + error.message);
    },
  });

  const deleteMutation = trpc.admin.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Categoria excluída com sucesso!");
      // Invalidar cache do admin E do site público
      utils.admin.categories.list.invalidate();
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao excluir categoria: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
  };

  const handleEdit = (category: NonNullable<typeof categories>[number]) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#3b82f6",
      isActive: category.isActive,
    });
    setEditingId(category.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
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
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteMutation.mutate({ id });
    }
  };

  const generateSlug = (name: string) => {
    return name
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
            <h1 className="text-3xl font-bold text-primary">Categorias</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as categorias de cursos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize as informações da categoria" : "Preencha as informações da nova categoria"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    placeholder="Ex: Saúde"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="saude"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição da categoria"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Ícone</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="Ex: heart"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Categoria ativa</Label>
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
            <CardTitle>Lista de Categorias</CardTitle>
            <CardDescription>
              {categories?.length ?? 0} categoria(s) cadastrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: category.color || "#3b82f6" }}
                        >
                          {category.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.slug}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${category.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {category.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nenhuma categoria cadastrada ainda.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar primeira categoria
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
