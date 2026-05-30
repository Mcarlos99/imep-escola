import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isDOMError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isDOMError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Verificar se é erro de DOM (comum com React 19 + Radix UI)
    const isDOMError = 
      error.message.includes("removeChild") || 
      error.message.includes("NotFoundError") ||
      error.message.includes("not a child of this node");
    
    // Se for erro de DOM, não mostrar a tela de erro
    if (isDOMError) {
      console.warn("DOM manipulation error detected (React 19 + Radix UI compatibility issue). Ignoring...");
      return { hasError: false, error: null, isDOMError: true };
    }
    
    return { hasError: true, error, isDOMError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Se for erro de DOM, apenas logar e não fazer nada
    if (this.state.isDOMError) {
      console.warn("DOM error suppressed - this is a known React 19 + Radix UI issue");
      return;
    }
    
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // Limpar estado antes de recarregar
    this.setState({ hasError: false, error: null, errorInfo: null, isDOMError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError && !this.state.isDOMError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4 text-foreground">Ocorreu um erro inesperado.</h2>
            
            <p className="text-muted-foreground mb-6 text-center">
              Estamos trabalhando para resolver. Por favor, recarregue a página.
            </p>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6 max-h-48">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.message || "Erro desconhecido"}
              </pre>
            </div>

            <button
              onClick={this.handleReload}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer transition-opacity"
              )}
            >
              <RotateCcw size={16} />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
