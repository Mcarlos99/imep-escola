import { Mail, MapPin, Phone, Clock, Send, Loader2, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // Carregar configurações do site
  const { data: phoneData } = trpc.settings.get.useQuery({ key: "phone" });
  const { data: whatsappData } = trpc.settings.get.useQuery({ key: "whatsapp" });
  const { data: emailData } = trpc.settings.get.useQuery({ key: "email" });
  const { data: addressData } = trpc.settings.get.useQuery({ key: "address" });

  const phone = phoneData?.value || "(94) 99243-5333";
  const whatsapp = whatsappData?.value || "5594992435333";
  const email = emailData?.value || "contato@imepedu.com.br";
  const address = addressData?.value || "Marabá - Pará";

  const sendMutation = trpc.contact.send.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar mensagem. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    sendMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary py-16 text-white">
        <div className="container text-center">
          <h1 className="font-heading font-bold text-4xl mb-4">Fale Conosco</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Estamos prontos para atender você. Entre em contato para tirar dúvidas, agendar visitas ou saber mais sobre nossos cursos.
          </p>
        </div>
      </div>

      <div className="container py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-heading font-bold text-2xl text-primary mb-6">Informações de Contato</h2>
              <p className="text-muted-foreground mb-8">
                Nossa equipe de atendimento está disponível de segunda a sexta para ajudar você em sua jornada educacional.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Endereço</h3>
                    <p className="text-muted-foreground">
                      {address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 text-secondary">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Telefone & WhatsApp</h3>
                    <p className="text-muted-foreground">
                      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                        {phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">E-mail</h3>
                    <p className="text-muted-foreground">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 text-secondary">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Horário de Atendimento</h3>
                    <p className="text-muted-foreground">
                      Segunda a Sexta: 08h às 21h<br />
                      Sábado: 08h às 13h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-green-800 mb-2">Prefere WhatsApp?</h3>
              <p className="text-green-700 text-sm mb-4">
                Fale diretamente com nossa equipe pelo WhatsApp para um atendimento mais rápido.
              </p>
              <a 
                href={`https://wa.me/${whatsapp}?text=Olá,%20gostaria%20de%20mais%20informações%20sobre%20os%20cursos%20do%20IMEP.`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Chamar no WhatsApp
                </Button>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="neumorphic-card p-8 md:p-10">
            <h2 className="font-heading font-bold text-2xl text-primary mb-6">Envie uma Mensagem</h2>
            
            {isSuccess ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-green-800 mb-2">Mensagem Enviada!</h3>
                <p className="text-muted-foreground">
                  Recebemos sua mensagem e entraremos em contato em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input 
                      id="name" 
                      placeholder="Seu nome" 
                      className="bg-background"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone / WhatsApp</Label>
                    <Input 
                      id="phone" 
                      placeholder="(00) 00000-0000" 
                      className="bg-background"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="bg-background"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input 
                    id="subject" 
                    placeholder="Sobre o que você quer falar?" 
                    className="bg-background"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Escreva sua mensagem aqui..." 
                    className="min-h-[150px] bg-background resize-none"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary/90 text-white h-12 text-lg font-semibold shadow-lg"
                  disabled={sendMutation.isPending}
                >
                  {sendMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Mensagem
                      <Send className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  * Campos obrigatórios. Suas informações são protegidas e não serão compartilhadas.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
