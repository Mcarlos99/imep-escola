import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2, GraduationCap } from "lucide-react";
import Layout from "@/components/layout/Layout";

export default function PreEnrollment() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    courseId: "",
    message: "",
    preferredShift: "",
    howDidYouHear: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: courses, isLoading: loadingCourses } = trpc.courses.list.useQuery();

  const createMutation = trpc.admin.preEnrollments.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Pré-matrícula enviada com sucesso!");
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        cpf: "",
        birthDate: "",
        courseId: "",
        message: "",
        preferredShift: "",
        howDidYouHear: "",
      });
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar pré-matrícula: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.courseId) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      cpf: formData.cpf || undefined,
      birthDate: formData.birthDate || undefined,
      courseId: parseInt(formData.courseId),
      message: formData.message || undefined,
      preferredShift: formData.preferredShift ? (formData.preferredShift as "morning" | "afternoon" | "evening" | "flexible") : undefined,
      howDidYouHear: formData.howDidYouHear || undefined,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[600px] flex items-center justify-center py-20">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-3">
                Pré-Matrícula Enviada!
              </h2>
              <p className="text-muted-foreground">
                Recebemos sua solicitação de pré-matrícula. Nossa equipe entrará em contato em breve para finalizar o processo.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => setSubmitted(false)}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                Fazer Nova Pré-Matrícula
              </Button>
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full"
              >
                Voltar para o Início
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-4">
              Pré-Matrícula Online
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Preencha o formulário abaixo e nossa equipe entrará em contato para finalizar sua matrícula
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-4 pb-2 border-b">
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    E-mail <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    Telefone/WhatsApp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Informações do Curso */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-4 pb-2 border-b">
                Informações do Curso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="courseId">
                    Curso de Interesse <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => handleChange("courseId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCourses ? (
                        <SelectItem value="loading" disabled>
                          Carregando cursos...
                        </SelectItem>
                      ) : courses && courses.length > 0 ? (
                        courses.map((course: any) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Nenhum curso disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredShift">Turno Preferido</Label>
                  <Select
                    value={formData.preferredShift}
                    onValueChange={(value) => handleChange("preferredShift", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Manhã</SelectItem>
                      <SelectItem value="afternoon">Tarde</SelectItem>
                      <SelectItem value="evening">Noite</SelectItem>
                      <SelectItem value="flexible">Flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="howDidYouHear">Como nos conheceu?</Label>
                  <Select
                    value={formData.howDidYouHear}
                    onValueChange={(value) => handleChange("howDidYouHear", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Indicação">Indicação</SelectItem>
                      <SelectItem value="Outdoor">Outdoor/Panfleto</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Deixe uma mensagem ou dúvida..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-secondary hover:bg-secondary/90 h-12 text-lg"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Pré-Matrícula"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                className="sm:w-auto h-12"
              >
                Cancelar
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              <span className="text-red-500">*</span> Campos obrigatórios
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}
