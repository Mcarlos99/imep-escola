import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  User, 
  Heart, 
  ChevronDown,
  Briefcase,
  ShoppingCart,
  Building2,
  GraduationCap,
  Cpu,
  HeartPulse,
  Monitor,
  Wrench,
  Leaf,
  FlaskConical,
  ShieldCheck,
  Factory,
  Languages,
  Megaphone,
  BookOpen,
  Code,
  TrendingUp,
  Sparkles,
  Stethoscope,
  Dog,
  Church,
  Scale,
  Laptop,
  Palette,
  Home,
  Sprout,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCoursesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Sobre Nós", href: "/sobre" },
    { name: "Contato", href: "/contato" },
  ];

  const coursesMenu = {
    technical: {
      title: "Cursos Técnicos",
      href: "/cursos",
      categories: [
        { name: "Administração", icon: Briefcase },
        { name: "Comércio", icon: ShoppingCart },
        { name: "Construção Civil", icon: Building2 },
        { name: "Educação", icon: GraduationCap },
        { name: "Eletrônica", icon: Cpu },
        { name: "Enfermagem", icon: HeartPulse },
        { name: "Informática", icon: Monitor },
        { name: "Mecânica", icon: Wrench },
        { name: "Meio Ambiente", icon: Leaf },
        { name: "Química", icon: FlaskConical },
        { name: "Segurança", icon: ShieldCheck }
      ]
    },
    professional: {
      title: "Cursos Profissionalizantes",
      href: "/cursos-profissionalizantes",
      categories: [
        { name: "Indústria", icon: Factory },
        { name: "Idiomas", icon: Languages },
        { name: "Marketing Digital", icon: Megaphone },
        { name: "Educação", icon: BookOpen },
        { name: "Tecnologia", icon: Code },
        { name: "Comércio e Vendas", icon: TrendingUp },
        { name: "Estética e Beleza", icon: Sparkles },
        { name: "Administração", icon: Briefcase },
        { name: "Saúde", icon: Stethoscope },
        { name: "Saúde Animal", icon: Dog },
        { name: "Teologia", icon: Church }
      ]
    },
    postgraduate: {
      title: "Pós-Graduação",
      href: "/pos-graduacao",
      areas: [
        { name: "Administração", icon: Briefcase },
        { name: "Direito", icon: Scale },
        { name: "Educação", icon: GraduationCap },
        { name: "Tecnologia da Informação", icon: Laptop },
        { name: "Design e Arquitetura", icon: Palette },
        { name: "Arquitetura e Urbanismo", icon: Home },
        { name: "Saúde", icon: HeartPulse },
        { name: "Agricultura e Meio Ambiente", icon: Sprout },
        { name: "Negócios e Finanças", icon: DollarSign },
        { name: "Comunicação e Marketing", icon: MessageSquare }
      ]
    }
  };

  const isCoursesActive = location === "/cursos" || location === "/cursos-profissionalizantes" || location === "/pos-graduacao";

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="/images/logo.png" alt="IMEP Logo" className="h-12 w-auto object-contain" />
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-secondary cursor-pointer relative group",
                    location === link.href
                      ? "text-secondary font-semibold"
                      : "text-foreground/80"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full",
                    location === link.href ? "w-full" : ""
                  )} />
                </span>
              </Link>
            ))}

            {/* Dropdown Nossos Cursos */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsCoursesDropdownOpen(!isCoursesDropdownOpen)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-secondary cursor-pointer relative group flex items-center gap-1",
                  isCoursesActive
                    ? "text-secondary font-semibold"
                    : "text-foreground/80"
                )}
              >
                Nossos Cursos
                <ChevronDown className={cn("w-4 h-4 transition-transform", isCoursesDropdownOpen && "rotate-180")} />
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full",
                  isCoursesActive ? "w-full" : ""
                )} />
              </button>

              {/* Dropdown Menu */}
              {isCoursesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[800px] bg-background border border-border/50 rounded-lg shadow-xl p-6 animate-in slide-in-from-top-5 fade-in">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Cursos Técnicos */}
                    <div>
                      <Link href={coursesMenu.technical.href}>
                        <h3 
                          className="font-bold text-primary mb-3 hover:text-secondary transition-colors cursor-pointer"
                          onClick={() => setIsCoursesDropdownOpen(false)}
                        >
                          {coursesMenu.technical.title}
                        </h3>
                      </Link>
                      <ul className="space-y-2">
                        {coursesMenu.technical.categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <li key={category.name}>
                              <Link href={`/cursos?categoria=${encodeURIComponent(category.name)}`}>
                                <span 
                                  className="text-sm text-foreground/70 hover:text-secondary transition-colors cursor-pointer flex items-center gap-2 group"
                                  onClick={() => setIsCoursesDropdownOpen(false)}
                                >
                                  <Icon className="w-4 h-4 text-primary/60 group-hover:text-secondary transition-colors" />
                                  {category.name}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Cursos Profissionalizantes */}
                    <div>
                      <Link href={coursesMenu.professional.href}>
                        <h3 
                          className="font-bold text-primary mb-3 hover:text-secondary transition-colors cursor-pointer"
                          onClick={() => setIsCoursesDropdownOpen(false)}
                        >
                          {coursesMenu.professional.title}
                        </h3>
                      </Link>
                      <ul className="space-y-2">
                        {coursesMenu.professional.categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <li key={category.name}>
                              <a 
                                href="https://cursosmagalhaeseduca.com.br/ead/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-foreground/70 hover:text-secondary transition-colors flex items-center gap-2 group"
                                onClick={() => setIsCoursesDropdownOpen(false)}
                              >
                                <Icon className="w-4 h-4 text-primary/60 group-hover:text-secondary transition-colors" />
                                {category.name}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Pós-Graduação */}
                    <div>
                      <Link href={coursesMenu.postgraduate.href}>
                        <h3 
                          className="font-bold text-primary mb-3 hover:text-secondary transition-colors cursor-pointer"
                          onClick={() => setIsCoursesDropdownOpen(false)}
                        >
                          {coursesMenu.postgraduate.title}
                        </h3>
                      </Link>
                      <ul className="space-y-2">
                        {coursesMenu.postgraduate.areas.map((area) => {
                          const Icon = area.icon;
                          return (
                            <li key={area.name}>
                              <Link href={`/pos-graduacao?area=${encodeURIComponent(area.name)}`}>
                                <span 
                                  className="text-sm text-foreground/70 hover:text-secondary transition-colors cursor-pointer flex items-center gap-2 group"
                                  onClick={() => setIsCoursesDropdownOpen(false)}
                                >
                                  <Icon className="w-4 h-4 text-primary/60 group-hover:text-secondary transition-colors" />
                                  {area.name}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/favoritos">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2">
                <Heart className="w-4 h-4" />
                Favoritos
              </Button>
            </Link>
            <a href="https://ava.imepedu.com.br/login/index.php" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2">
                <User className="w-4 h-4" />
                Área do Aluno
              </Button>
            </a>
            <Link href="https://finan.imepedu.com.br/pre-matricula" target="_blank" rel="noopener noreferrer">
              <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all rounded-full px-6">
                Matricule-se
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border/50 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <span
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium transition-colors cursor-pointer",
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </span>
              </Link>
            ))}

            {/* Mobile Courses Menu */}
            <div className="space-y-2">
              <div className="px-3 py-2 text-sm font-bold text-primary">Nossos Cursos</div>
              
              {/* Cursos Técnicos */}
              <Link href={coursesMenu.technical.href}>
                <span
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium transition-colors cursor-pointer",
                    location === coursesMenu.technical.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {coursesMenu.technical.title}
                </span>
              </Link>

              {/* Cursos Profissionalizantes */}
              <Link href={coursesMenu.professional.href}>
                <span
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium transition-colors cursor-pointer",
                    location === coursesMenu.professional.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {coursesMenu.professional.title}
                </span>
              </Link>

              {/* Pós-Graduação */}
              <Link href={coursesMenu.postgraduate.href}>
                <span
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium transition-colors cursor-pointer",
                    location === coursesMenu.postgraduate.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {coursesMenu.postgraduate.title}
                </span>
              </Link>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <a href="https://ava.imepedu.com.br/login/index.php" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full justify-start gap-2 border-primary/20 text-primary">
                  <User className="w-4 h-4" />
                  Área do Aluno
                </Button>
              </a>
              <Link href="/pre-matricula">
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white" onClick={() => setIsOpen(false)}>
                  Matricule-se Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
