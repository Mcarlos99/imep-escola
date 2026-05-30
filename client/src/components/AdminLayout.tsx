import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  BookOpen, 
  FolderOpen, 
  MessageSquare, 
  Settings,
  Home,
  ShieldAlert,
  Users,
  ClipboardList
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: BookOpen, label: "Cursos Técnicos", path: "/admin/cursos" },
  { icon: FolderOpen, label: "Categorias", path: "/admin/categorias" },
  { icon: ClipboardList, label: "Pré-Matrículas", path: "/admin/pre-matriculas" },
  { icon: Users, label: "Matrículas", path: "/admin/matriculas" },
  { icon: MessageSquare, label: "Depoimentos", path: "/admin/depoimentos" },
  { icon: Settings, label: "Configurações", path: "/admin/configuracoes" },
];

const SIDEBAR_WIDTH_KEY = "admin-sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-primary text-center">
              Área Administrativa
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Faça login para acessar o painel de gerenciamento do site IMEP.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
          >
            Entrar
          </Button>
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" />
            Voltar para o site
          </a>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-red-600 text-center">
              Acesso Negado
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Você não tem permissão para acessar esta área. Entre em contato com o administrador do sistema.
            </p>
          </div>
          <a href="/">
            <Button
              size="lg"
              variant="outline"
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar para o site
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <AdminLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </AdminLayoutContent>
    </SidebarProvider>
  );
}

type AdminLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function AdminLayoutContent({
  children,
  setSidebarWidth,
}: AdminLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-primary"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center bg-primary">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-white/80" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-white tracking-tight truncate">
                    IMEP Admin
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-primary overflow-y-auto">
            <SidebarMenu className="px-2 py-1 flex-shrink-0">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal text-white/80 hover:text-white hover:bg-white/10 ${isActive ? "bg-white/20 text-white" : ""}`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-secondary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            
            {/* Link to public site */}
            <div className="px-2 mt-4 pt-4 border-t border-white/10">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => window.open("/", "_blank")}
                    tooltip="Ver Site"
                    className="h-10 transition-all font-normal text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Home className="h-4 w-4" />
                    <span>Ver Site</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>

          <SidebarFooter className="p-3 bg-primary">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-white/10 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <Avatar className="h-9 w-9 border border-white/20 shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-secondary text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-white">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-white/60 truncate mt-1.5">
                      Administrador
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-secondary/50 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-primary px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-white/10 text-white" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-white font-medium">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
      </SidebarInset>
    </>
  );
}
