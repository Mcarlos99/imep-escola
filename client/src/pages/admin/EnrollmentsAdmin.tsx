import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Users, CheckCircle2, XCircle, Clock, Award, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type EnrollmentStatus = "pending" | "active" | "completed" | "cancelled";

export default function EnrollmentsAdmin() {
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "all">("all");
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<EnrollmentStatus>("active");
  const [notes, setNotes] = useState("");

  const { data: enrollments, isLoading, refetch } = trpc.admin.enrollments.listAll.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateStatusMutation = trpc.admin.enrollments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleUpdateStatus = () => {
    if (!selectedEnrollment) return;
    
    updateStatusMutation.mutate({
      id: selectedEnrollment.id,
      status: newStatus,
      notes: notes || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: "secondary", icon: Clock, label: "Pendente" },
      active: { variant: "default", icon: CheckCircle2, label: "Ativa" },
      completed: { variant: "default", icon: Award, label: "Concluída" },
      cancelled: { variant: "destructive", icon: XCircle, label: "Cancelada" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "-";
    return `R$ ${parseFloat(price).toFixed(2).replace(".", ",")}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Matrículas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as matrículas dos alunos
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por aluno ou curso..."
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total", count: enrollments?.length || 0, color: "bg-blue-500" },
          { label: "Ativas", count: enrollments?.filter((e: any) => e.status === "active").length || 0, color: "bg-green-500" },
          { label: "Concluídas", count: enrollments?.filter((e: any) => e.status === "completed").length || 0, color: "bg-purple-500" },
          { label: "Pendentes", count: enrollments?.filter((e: any) => e.status === "pending").length || 0, color: "bg-orange-500" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white font-bold text-xl`}>
                {stat.count}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">Matrículas</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments && enrollments.length > 0 ? (
              enrollments.map((enrollment: any) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{enrollment.userName || "Sem nome"}</p>
                      <p className="text-sm text-muted-foreground">{enrollment.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{enrollment.courseName}</p>
                      <p className="text-sm text-muted-foreground">{enrollment.courseSlug}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(enrollment.enrollmentDate)}</TableCell>
                  <TableCell>{formatPrice(enrollment.coursePrice)}</TableCell>
                  <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEnrollment(enrollment);
                        setNewStatus(enrollment.status as EnrollmentStatus);
                        setNotes(enrollment.notes || "");
                        setIsDialogOpen(true);
                      }}
                    >
                      Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Nenhuma matrícula encontrada</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Matrícula</DialogTitle>
            <DialogDescription>
              Atualize o status e adicione observações sobre a matrícula
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Aluno</label>
                <p className="text-sm text-muted-foreground">
                  {selectedEnrollment.userName} ({selectedEnrollment.userEmail})
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Curso</label>
                <p className="text-sm text-muted-foreground">{selectedEnrollment.courseName}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={(value: EnrollmentStatus) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre a matrícula..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
