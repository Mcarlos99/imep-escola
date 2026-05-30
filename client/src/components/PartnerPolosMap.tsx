import { MapPin } from 'lucide-react';

interface Polo {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  color: string;
}

const POLOS: Polo[] = [
  {
    id: 'breu-branco',
    name: 'IMEP - Sede Principal',
    city: 'Breu Branco',
    state: 'PA',
    description: 'Rua Parauapebas, 145',
    color: '#FF6B35'
  },
  {
    id: 'mocajuba',
    name: 'Polo Mocajuba',
    city: 'Mocajuba',
    state: 'PA',
    description: 'Polo Educacional Mocajuba',
    color: '#004E89'
  },
  {
    id: 'consultoria-r3',
    name: 'Consultoria R3',
    city: 'Consultoria R3',
    state: 'PA',
    description: 'Polo Consultoria R3',
    color: '#1B4965'
  },
  {
    id: 'pacaja',
    name: 'Polo Pacajá',
    city: 'Pacajá',
    state: 'PA',
    description: 'Polo Educacional Pacajá',
    color: '#F77F00'
  },
  {
    id: 'igarape-miri',
    name: 'Polo Igarapé Miri',
    city: 'Igarapé Miri',
    state: 'PA',
    description: 'Polo Educacional Igarapé Miri',
    color: '#D62828'
  }
];

export default function PartnerPolosMap() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="text-secondary font-semibold text-sm">Nossos Polos</span>
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
            Polos Parceiros do <span className="text-secondary">IMEP</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Presente em toda a região do Pará com polos educacionais estrategicamente localizados para melhor atender nossos alunos.
          </p>
        </div>

        {/* Polos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {POLOS.map((polo) => (
            <div
              key={polo.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-secondary transition-all duration-300 cursor-pointer"
            >
              {/* Indicador de cor */}
              <div
                className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-1"
                style={{ backgroundColor: polo.color }}
              />

              {/* Conteúdo */}
              <div className="pl-2">
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: polo.color }}
                  />
                  <h3 className="font-bold text-sm text-foreground group-hover:text-secondary transition-colors">
                    {polo.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {polo.city}, {polo.state}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {polo.description}
                </p>
              </div>

              {/* Badge de destaque */}
              {polo.id === 'breu-branco' && (
                <div className="absolute top-2 right-2 bg-secondary/20 text-secondary text-xs font-semibold px-2 py-1 rounded-full">
                  Sede
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Visite um de nossos polos e conheça a infraestrutura do IMEP
          </p>
          <a href="https://wa.me/5594981606474?text=Olá%2C%20gostaria%20de%20conhecer%20um%20de%20seus%20polos!" target="_blank" rel="noopener noreferrer">
            <button className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:-translate-y-1">
              Agendar Visita
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
