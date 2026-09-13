import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React lifecycle:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('recetario_ia_recipes_v1');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 text-stone-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-6 text-center shadow-md">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">
              Se produjo un problema al cargar
            </h1>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              Hubo una interrupción al renderizar los datos o el video. Puedes reiniciar el estado para restablecer las recetas de forma segura.
            </p>
            {this.state.error && (
              <pre className="text-[11px] font-mono text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 overflow-x-auto text-left mb-6 max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer Recetas y Recargar</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
