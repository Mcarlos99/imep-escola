import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PreEnrollmentFormProps {
  courseId?: number;
  courseName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PreEnrollmentForm({
  courseId,
  courseName,
  open,
  onOpenChange,
}: PreEnrollmentFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    courseId: courseId || 0,
    message: "",
    preferredShift: "",
    howDidYouHear: "",
  });

  const { data: courses } = trpc.courses.list.useQuery();
  const createMutation = trpc.admin.preEnrollments.create.useMutation({
    onSuccess: () => {
      toast.success("Pré-matrícula enviada com sucesso! Em breve nossa equipe entrará em contato com você.");
      onOpenChange(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        cpf: "",
        birthDate: "",
        courseId: courseId || 0,
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
    
    if (!formData.courseId) {
      toast.error("Por favor, selecione o curso de seu interesse.");
      return;
    }

    createMutation.mutate(formData as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Pré-Matrícula Online
          </DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo e nossa equipe entrará em contato para
            finalizar sua matrícula.
            {courseName && (
              <span className="block mt-2 font-semibold text-secondary">
                Curso: {courseName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                E-mail <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone/WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(94) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value })
                }
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseId">
                Curso de Interesse <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.courseId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, courseId: parseInt(value) })
                }
                disabled={!!courseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredShift">Turno Preferido</Label>
              <Select
                value={formData.preferredShift}
                onValueChange={(value) =>
                  setFormData({ ...formData, preferredShift: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Manhã</SelectItem>
                  <SelectItem value="afternoon">Tarde</SelectItem>
                  <SelectItem value="evening">Noite</SelectItem>
                  <SelectItem value="flexible">Flexível</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="howDidYouHear">Como nos conheceu?</Label>
              <Select
                value={formData.howDidYouHear}
                onValueChange={(value) =>
                  setFormData({ ...formData, howDidYouHear: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="outdoor">Outdoor/Panfleto</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Conte-nos um pouco sobre seus objetivos e expectativas..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-secondary hover:bg-secondary/90"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Pré-Matrícula"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
