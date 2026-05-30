import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SettingsFormData = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
};

const defaultSettings: SettingsFormData = {
  phone: "(94) 99243-5333",
  whatsapp: "5594992435333",
  email: "contato@imepedu.com.br",
  address: "Marabá, Pará",
  instagram: "",
  facebook: "",
  linkedin: "",
  heroTitle: "Construa seu futuro com Educação Profissional de Excelência",
  heroSubtitle: "No IMEP, unimos teoria e prática para formar os profissionais que o mercado procura.",
  aboutText: "",
};

export default function SettingsAdmin() {
  const [formData, setFormData] = useState<SettingsFormData>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.admin.settings.list.useQuery();

  const upsertMutation = trpc.admin.settings.upsert.useMutation({
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  useEffect(() => {
    if (settings) {
      const newFormData = { ...defaultSettings };
      settings.forEach((setting) => {
        if (setting.key in newFormData) {
          (newFormData as Record<string, string>)[setting.key] = setting.value || "";
        }
      });
      setFormData(newFormData);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        type: "text" as const,
        label: getLabel(key),
        group: getGroup(key),
      }));

      for (const setting of settingsToSave) {
        await upsertMutation.mutateAsync(setting);
      }

      // Invalidar cache do admin E do público
      utils.admin.settings.list.invalidate();
      utils.settings.invalidate();
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getLabel = (key: string): string => {
    const labels: Record<string, string> = {
      phone: "Telefone",
      whatsapp: "WhatsApp",
      email: "E-mail",
      address: "Endereço",
      instagram: "Instagram",
      facebook: "Facebook",
      linkedin: "LinkedIn",
      heroTitle: "Título Principal",
      heroSubtitle: "Subtítulo",
      aboutText: "Texto Sobre",
    };
    return labels[key] || key;
  };

  const getGroup = (key: string): string => {
    if (["phone", "whatsapp", "email", "address"].includes(key)) return "contact";
    if (["instagram", "facebook", "linkedin"].includes(key)) return "social";
    return "content";
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Configurações</h1>
            <p className="text-muted-foreground mt-1">
              Configure as informações gerais do site
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            className="bg-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>
                Dados de contato exibidos no site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(94) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (apenas números)</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="5594999999999"
                />
                <p className="text-xs text-muted-foreground">
                  Formato: código do país + DDD + número (sem espaços ou símbolos)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@imepedu.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Cidade, Estado"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Links para as redes sociais do IMEP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/imep"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="https://facebook.com/imep"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/imep"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Conteúdo do Site</CardTitle>
              <CardDescription>
                Textos principais exibidos na página inicial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Título Principal (Hero)</Label>
                <Input
                  id="heroTitle"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  placeholder="Título principal da página inicial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Subtítulo (Hero)</Label>
                <Textarea
                  id="heroSubtitle"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  placeholder="Subtítulo da página inicial"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutText">Texto "Sobre Nós"</Label>
                <Textarea
                  id="aboutText"
                  value={formData.aboutText}
                  onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                  placeholder="Texto descritivo sobre o IMEP"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
