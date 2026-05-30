import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Contact from "./pages/Contact";
import About from "./pages/About";
import CourseDetail from "./pages/CourseDetail";
import Favorites from "./pages/Favorites";
import Testimonials from "./pages/Testimonials";
import ProfessionalCourses from "./pages/ProfessionalCourses";
import PostGraduation from "./pages/PostGraduation";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";
import StudentProfile from "./pages/StudentProfile";
import AdminDashboard from "./pages/admin/Dashboard";
import CoursesAdmin from "./pages/admin/CoursesAdmin";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
import EnrollmentsAdmin from "./pages/admin/EnrollmentsAdmin";
import PreEnrollmentsAdmin from "./pages/admin/PreEnrollmentsAdmin";
import PreEnrollment from "./pages/PreEnrollment";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/cursos" component={Courses} />
      <Route path="/contato" component={Contact} />
      <Route path="/sobre" component={About} />
      <Route path="/curso/:slug" component={CourseDetail} />
      <Route path="/favoritos" component={Favorites} />
      <Route path="/depoimentos" component={Testimonials} />
      <Route path="/cursos-profissionalizantes" component={ProfessionalCourses} />
      <Route path="/pos-graduacao" component={PostGraduation} />
      <Route path="/matricula/sucesso" component={EnrollmentSuccess} />
      <Route path="/perfil" component={StudentProfile} />
      <Route path="/area-aluno" component={StudentProfile} />
      <Route path="/pre-matricula" component={PreEnrollment} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/cursos" component={CoursesAdmin} />
      <Route path="/admin/categorias" component={CategoriesAdmin} />
      <Route path="/admin/depoimentos" component={TestimonialsAdmin} />
      <Route path="/admin/configuracoes" component={SettingsAdmin} />
      <Route path="/admin/matriculas" component={EnrollmentsAdmin} />
      <Route path="/admin/pre-matriculas" component={PreEnrollmentsAdmin} />
      
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
