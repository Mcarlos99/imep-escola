import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  GraduationCap,
  CreditCard,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  Award,
  Mail,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentProfile() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("enrollments");

  // Fetch enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = trpc.admin.enrollments.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch payment history
  const { data: payments, isLoading: paymentsLoading } = trpc.admin.payments.history.useQuery(
    undefined,
    { enabled: !!user }
  );

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `R$ ${numAmount.toFixed(2).replace(".", ",")}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string; color: string }> = {
      pending: { variant: "secondary", icon: Clock, label: "Pendente", color: "text-orange-600" },
      active: { variant: "default", icon: CheckCircle2, label: "Ativa", color: "text-green-600" },
      completed: { variant: "default", icon: Award, label: "Concluída", color: "text-purple-600" },
      cancelled: { variant: "destructive", icon: null, label: "Cancelada", color: "text-red-600" },
      succeeded: { variant: "default", icon: CheckCircle2, label: "Pago", color: "text-green-600" },
      failed: { variant: "destructive", icon: null, label: "Falhou", color: "text-red-600" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </Badge>
    );
  };

  const getReceiptMutation = trpc.admin.payments.getReceipt.useQuery;
  
  const handleDownloadReceipt = async (paymentId: number) => {
    try {
      toast.info("Buscando recibo...");
      
      // Fetch receipt URL from API
      const response = await fetch(`/api/trpc/admin.payments.getReceipt?input=${encodeURIComponent(JSON.stringify({ paymentId }))}`);
      const data = await response.json();
      
      if (data.result?.data?.receiptUrl) {
        window.open(data.result.data.receiptUrl, "_blank");
        toast.success("Recibo aberto em nova aba!");
      } else {
        toast.error("Recibo não disponível para este pagamento");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao buscar recibo");
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground">Faça login para acessar seu perfil</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name || "Aluno"}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="enrollments" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Matrículas
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Minhas Matrículas
                </CardTitle>
                <CardDescription>
                  Acompanhe o status dos seus cursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : enrollments && enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              {enrollment.courseImage && (
                                <img
                                  src={enrollment.courseImage}
                                  alt={enrollment.courseName}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">{enrollment.courseName}</h3>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(enrollment.enrollmentDate)}
                                  </span>
                                  {enrollment.courseDuration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {enrollment.courseDuration}
                                    </span>
                                  )}
                                  {enrollment.courseModality && (
                                    <Badge variant="outline">
                                      {enrollment.courseModality === "presencial"
                                        ? "Presencial"
                                        : enrollment.courseModality === "ead"
                                        ? "EAD"
                                        : "Híbrido"}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(enrollment.status)}
                            {enrollment.certificateUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(enrollment.certificateUrl, "_blank")}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Certificado
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">Você ainda não possui matrículas</p>
                    <Button onClick={() => (window.location.href = "/cursos")}>
                      Ver Cursos Disponíveis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Histórico de Pagamentos
                </CardTitle>
                <CardDescription>
                  Visualize e baixe seus recibos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.createdAt)}</TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(payment.amount)}
                            </TableCell>
                            <TableCell className="capitalize">
                              {payment.paymentMethod === "card"
                                ? "Cartão"
                                : payment.paymentMethod === "boleto"
                                ? "Boleto"
                                : payment.paymentMethod || "-"}
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="text-right">
                              {payment.status === "succeeded" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadReceipt(payment.id)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Recibo
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhum pagamento registrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Seus dados cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    <p className="text-lg">{user.name || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                    <p className="text-lg">{user.email || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Membro desde
                    </label>
                    <p className="text-lg">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Último acesso
                    </label>
                    <p className="text-lg">{formatDate(user.lastSignedIn)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    Precisa atualizar suas informações? Entre em contato conosco.
                  </p>
                  <a
                    href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20gostaria%20de%20atualizar%20meus%20dados%20cadastrais"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Falar no WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
