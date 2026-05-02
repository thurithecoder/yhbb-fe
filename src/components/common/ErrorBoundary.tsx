import * as React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
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
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 text-center space-y-8">
            <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase">SOMETHING <span className="text-red-500">WENT WRONG</span></h1>
              <p className="text-neutral-500 font-medium">We encountered an unexpected error. Don't worry, it's not your fault.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl text-left overflow-auto max-h-32">
              <code className="text-xs font-mono text-neutral-400">{this.state.error?.message}</code>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-neutral-900 hover:bg-[#6EA15C] text-white rounded-2xl font-black uppercase tracking-tight transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Reload App
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
