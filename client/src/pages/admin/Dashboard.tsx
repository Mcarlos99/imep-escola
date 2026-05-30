import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BookOpen, FolderOpen, MessageSquare, TrendingUp, Users, ClipboardList, ExternalLink, RefreshCw } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: courses, isLoading: loadingCourses, refetch: refetchCourses } = trpc.admin.courses.list.useQuery();
  const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = trpc.admin.categories.list.useQuery();
  const { data: testimonials, isLoading: loadingTestimonials, refetch: refetchTestimonials } = trpc.admin.testimonials.list.useQuery();
  const { data: enrollments, isLoading: loadingEnrollments, refetch: refetchEnrollments } = trpc.admin.enrollments.listAll.useQuery({});
  const { data: preEnrollments, isLoading: loadingPreEnrollments, refetch: refetchPreEnrollments } = trpc.admin.preEnrollments.list.useQuery();

  const handleRefreshAll = () => {
    refetchCourses();
    refetchCategories();
    refetchTestimonials();
    refetchEnrollments();
    refetchPreEnrollments();
  };

  const stats = [
    {
      title: "Cursos",
      value: courses?.length ?? 0,
      description: "Cursos cadastrados",
      icon: BookOpen,
      color: "bg-blue-500",
      link: "/admin/cursos",
    },
    {
      title: "Categorias",
      value: categories?.length ?? 0,
      description: "Categorias ativas",
      icon: FolderOpen,
      color: "bg-green-500",
      link: "/admin/categorias",
    },
    {
      title: "Matrículas",
      value: enrollments?.length ?? 0,
      description: "Alunos matriculados",
      icon: Users,
      color: "bg-purple-500",
      link: "/admin/matriculas",
    },
    {
      title: "Pré-Matrículas",
      value: preEnrollments?.length ?? 0,
      description: "Interessados",
      icon: ClipboardList,
      color: "bg-orange-500",
      link: "/admin/pre-matriculas",
    },
  ];

  const isLoading = loadingCourses || loadingCategories || loadingTestimonials || loadingEnrollments || loadingPreEnrollments;

  // Count new pre-enrollments (status = "new")
  const newPreEnrollments = preEnrollments?.filter((p: any) => p.status === "new").length ?? 0;
  
  // Count active enrollments
  const activeEnrollments = enrollments?.filter((e: any) => e.status === "active").length ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do site IMEP
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefreshAll} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Site
              </Button>
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Link key={idx} href={stat.link}>
              <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? "..." : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Alert Cards */}
        {(newPreEnrollments > 0 || activeEnrollments > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newPreEnrollments > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-700 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Novas Pré-Matrículas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-600">
                    Você tem <span className="font-bold text-lg">{newPreEnrollments}</span> pré-matrícula(s) aguardando contato.
                  </p>
                  <Link href="/admin/pre-matriculas">
                    <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
                      Ver Pré-Matrículas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            {activeEnrollments > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Matrículas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600">
                    Você tem <span className="font-bold text-lg">{activeEnrollments}</span> aluno(s) com matrícula ativa.
                  </p>
                  <Link href="/admin/matriculas">
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">
                      Ver Matrículas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cursos Recentes</CardTitle>
              <CardDescription>Últimos cursos cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCourses ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : courses && courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.modality === "presencial" ? "Presencial" : 
                           course.modality === "ead" ? "EAD" : "Híbrido"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${course.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {course.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum curso cadastrado ainda.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Pré-Matrículas</CardTitle>
              <CardDescription>Interessados recentes</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPreEnrollments ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : preEnrollments && preEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {preEnrollments.slice(0, 5).map((preEnrollment: any) => (
                    <div key={preEnrollment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{preEnrollment.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {preEnrollment.course?.title || "Curso não especificado"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        preEnrollment.status === "new" ? "bg-blue-100 text-blue-700" :
                        preEnrollment.status === "contacted" ? "bg-yellow-100 text-yellow-700" :
                        preEnrollment.status === "converted" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {preEnrollment.status === "new" ? "Novo" :
                         preEnrollment.status === "contacted" ? "Contatado" :
                         preEnrollment.status === "converted" ? "Convertido" : "Perdido"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma pré-matrícula recebida ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Depoimentos e Categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Depoimentos</CardTitle>
              <CardDescription>Depoimentos de alunos</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTestimonials ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : testimonials && testimonials.length > 0 ? (
                <div className="space-y-4">
                  {testimonials.slice(0, 3).map((testimonial) => (
                    <div key={testimonial.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{testimonial.name}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${testimonial.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {testimonial.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        "{testimonial.content}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum depoimento cadastrado ainda.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>Categorias de cursos disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color || "#3b82f6" }}
                        />
                        <p className="font-medium">{category.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {category.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
