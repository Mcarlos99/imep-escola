import Layout from "@/components/layout/Layout";
import { trpc } from "@/lib/trpc";
import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  const { data: testimonials, isLoading } = trpc.testimonials.list.useQuery();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/90 text-white py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              Depoimentos de <span className="text-secondary">Nossos Alunos</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Conheça as histórias de sucesso de quem escolheu o IMEP para transformar sua carreira profissional
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-white">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando depoimentos...</p>
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <p className="text-muted-foreground">
                  <span className="font-bold text-primary text-2xl">{testimonials.length}</span> depoimentos de alunos satisfeitos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <div 
                    key={testimonial.id} 
                    className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative group"
                  >
                    <Quote className="absolute top-4 right-4 w-12 h-12 text-secondary/10 group-hover:text-secondary/20 transition-colors" />
                    
                    <div className="flex items-center gap-4 mb-6">
                      {testimonial.image ? (
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-secondary shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-md">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-primary">{testimonial.name}</h3>
                        {testimonial.course && (
                          <p className="text-sm text-muted-foreground">{testimonial.course}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 mb-4">
                      {renderStars(testimonial.rating || 5)}
                    </div>

                    <p className="text-muted-foreground leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum depoimento disponível no momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
            Faça Parte Dessa História de Sucesso
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de alunos que já transformaram suas vidas com os cursos técnicos do IMEP
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20minha%20matr%C3%ADcula%21" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Matricule-se Agora
            </a>
            <a 
              href="https://wa.me/5594992435333?text=Ol%C3%A1%2C%20tenho%20d%C3%BAvidas%20sobre%20os%20cursos." 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-full transition-all"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
