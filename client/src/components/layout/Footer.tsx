import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white p-2 rounded-lg inline-block">
                <img src="/images/logo.png" alt="IMEP Logo" className="h-10 w-auto object-contain" />
              </div>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Transformando vidas através da educação técnica de qualidade. 
              Prepare-se para o mercado de trabalho com quem entende do assunto.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-6 text-secondary">Institucional</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sobre">
                  <span className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block cursor-pointer">Sobre Nós</span>
                </Link>
              </li>
              <li>
                <Link href="/cursos">
                  <span className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block cursor-pointer">Nossos Cursos</span>
                </Link>
              </li>
              <li>
                <a href="https://ava.imepedu.com.br/login/index.php" target="_blank" rel="noopener noreferrer">
                  <span className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block cursor-pointer">Portal do Aluno</span>
                </a>
              </li>
              <li>
                <Link href="/trabalhe-conosco">
                  <span className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block cursor-pointer">Trabalhe Conosco</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-6 text-secondary">Cursos Populares</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cursos/enfermagem">
                  <span className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block cursor-pointer">Técnico em Enfermagem</span>
                </Link>
              </li>
              <li>
                <Link href="/cursos/seguranca-trabalho">
                  <span className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block cursor-pointer">Segurança do Trabalho</span>
                </Link>
              </li>
              <li>
                <Link href="/cursos/radiologia">
                  <span className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block cursor-pointer">Radiologia</span>
                </Link>
              </li>
              <li>
                <Link href="/cursos/administracao">
                  <span className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block cursor-pointer">Administração</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-6 text-secondary">Fale Conosco</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-1" />
                <span className="text-blue-100 text-sm">
                  Rua. Parauapebas, 145, BREU BRANCO-PA
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-blue-100 text-sm">94981606474</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-blue-100 text-sm">diretor@magalhaes-edu.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-200 text-xs text-center md:text-left">
            © {new Date().getFullYear()} IMEP - Instituto Magalhães de Educação Profissional. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <Link href="/privacidade">
              <span className="text-blue-200 hover:text-white text-xs cursor-pointer">Política de Privacidade</span>
            </Link>
            <Link href="/termos">
              <span className="text-blue-200 hover:text-white text-xs cursor-pointer">Termos de Uso</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
