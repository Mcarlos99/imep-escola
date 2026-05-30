import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, AlertCircle, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

export default function EnrollmentSuccess() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    setSessionId(sid);
  }, []);

  const { data, isLoading, error } = trpc.admin.payments.verifySession.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId, retry: false }
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Processando seu pagamento...</h2>
              <p className="text-muted-foreground">
                Aguarde enquanto confirmamos sua matrícula.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !data?.success) {
    return (
      <Layout>
        <div className="container py-20">
          <Card className="max-w-2xl mx-auto border-destructive">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-6 text-destructive" />
              <h2 className="text-2xl font-bold mb-2">Erro ao processar pagamento</h2>
              <p className="text-muted-foreground mb-6">
                Não foi possível confirmar seu pagamento. Por favor, entre em contato conosco.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contato">
                  <Button variant="default">
                    Falar com Suporte
                  </Button>
                </Link>
                <Link href="/cursos">
                  <Button variant="outline">
                    Ver Cursos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const enrollment: any = data.enrollment;

  return (
    <Layout>
      <div className="container py-20">
        <Card className="max-w-2xl mx-auto border-green-500">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">
              Matrícula Confirmada!
            </CardTitle>
            <CardDescription className="text-lg">
              Parabéns! Sua matrícula foi realizada com sucesso.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Course Info */}
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Detalhes do Curso</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Curso:</span>
                  <span className="font-medium">{enrollment.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data da Matrícula:</span>
                  <span className="font-medium">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Ativa
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Próximos Passos</h3>
              <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                <li>Você receberá um e-mail com os detalhes da sua matrícula</li>
                <li>Acesse a área do aluno para ver seus materiais de estudo</li>
                <li>Fique atento às datas de início das aulas</li>
                <li>Em caso de dúvidas, entre em contato conosco pelo WhatsApp</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/area-aluno" className="flex-1">
                <Button className="w-full" size="lg">
                  Acessar Área do Aluno
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/cursos" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  Ver Outros Cursos
                </Button>
              </Link>
            </div>

            {/* WhatsApp Contact */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Precisa de ajuda? Fale conosco pelo WhatsApp
              </p>
              <a
                href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20acabei%20de%20me%20matricular%20e%20tenho%20uma%20d%C3%BAvida"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Falar no WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
