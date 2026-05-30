import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PreEnrollmentsAdmin() {
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: preEnrollments, isLoading, refetch } = trpc.admin.preEnrollments.list.useQuery();

  const updateStatusMutation = trpc.admin.preEnrollments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.preEnrollments.delete.useMutation({
    onSuccess: () => {
      toast.success("Pré-matrícula excluída com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status: status as any });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta pré-matrícula?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleViewDetails = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setShowDetails(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      new: { label: "Novo", className: "bg-blue-500" },
      contacted: { label: "Contatado", className: "bg-yellow-500" },
      converted: { label: "Convertido", className: "bg-green-500" },
      lost: { label: "Perdido", className: "bg-red-500" },
    };

    const variant = variants[status] || variants.new;
    return (
      <Badge className={`${variant.className} text-white`}>
        {variant.label}
      </Badge>
    );
  };

  const getShiftLabel = (shift?: string) => {
    const shifts: Record<string, string> = {
      morning: "Manhã",
      afternoon: "Tarde",
      evening: "Noite",
      flexible: "Flexível",
    };
    return shifts[shift || ""] || "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Pré-Matrículas</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as solicitações de pré-matrícula recebidas
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-bold">{preEnrollments?.length || 0}</span> pré-matrículas
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preEnrollments && preEnrollments.length > 0 ? (
                  preEnrollments.map((enrollment: any) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.fullName}
                      </TableCell>
                      <TableCell>{enrollment.email}</TableCell>
                      <TableCell>{enrollment.phone}</TableCell>
                      <TableCell>{enrollment.course?.title || "-"}</TableCell>
                      <TableCell>
                        {enrollment.createdAt 
                          ? format(new Date(enrollment.createdAt), "dd/MM/yyyy", { locale: ptBR })
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Select
                          value={enrollment.status}
                          onValueChange={(value) =>
                            handleStatusChange(enrollment.id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Novo</SelectItem>
                            <SelectItem value="contacted">Contatado</SelectItem>
                            <SelectItem value="converted">Convertido</SelectItem>
                            <SelectItem value="lost">Perdido</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(enrollment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(enrollment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma pré-matrícula encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Pré-Matrícula</DialogTitle>
            <DialogDescription>
              Informações completas do interessado
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome Completo</p>
                  <p className="font-semibold">{selectedEnrollment.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-semibold">{selectedEnrollment.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone/WhatsApp</p>
                  <p className="font-semibold">{selectedEnrollment.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-semibold">{selectedEnrollment.cpf || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-semibold">
                    {selectedEnrollment.birthDate && new Date(selectedEnrollment.birthDate).toString() !== 'Invalid Date'
                      ? format(new Date(selectedEnrollment.birthDate), "dd/MM/yyyy", { locale: ptBR })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Turno Preferido</p>
                  <p className="font-semibold">
                    {getShiftLabel(selectedEnrollment.preferredShift)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Como nos conheceu</p>
                  <p className="font-semibold">
                    {selectedEnrollment.howDidYouHear || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedEnrollment.status)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Curso de Interesse</p>
                <p className="font-semibold text-lg text-primary">
                  {selectedEnrollment.course?.title || "-"}
                </p>
              </div>

              {selectedEnrollment.message && (
                <div>
                  <p className="text-sm text-muted-foreground">Mensagem</p>
                  <p className="font-semibold whitespace-pre-line">
                    {selectedEnrollment.message}
                  </p>
                </div>
              )}

              {selectedEnrollment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações Internas</p>
                  <p className="font-semibold whitespace-pre-line">
                    {selectedEnrollment.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Recebido em:{" "}
                  {format(
                    new Date(selectedEnrollment.createdAt),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
                <a
                  href={`https://wa.me/55${selectedEnrollment.phone.replace(/\D/g, "")}?text=Olá ${selectedEnrollment.fullName}, vi sua pré-matrícula para o curso ${selectedEnrollment.course?.title}!`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-600 hover:bg-green-700">
                    Contatar via WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
