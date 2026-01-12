
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-6 text-white font-sans">
                    <div className="max-w-xl w-full bg-[#181a1f] border border-red-500/30 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-500/20 rounded-full">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-red-400">Application Crashed</h1>
                        </div>

                        <p className="text-slate-400 mb-6">
                            Something went wrong while rendering this page.
                            This is usually caused by a configuration error or a bug.
                        </p>

                        {this.state.error && (
                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-red-200 overflow-auto max-h-40 mb-6">
                                <strong>Error:</strong> {this.state.error.toString()}
                                <br />
                                {this.state.errorInfo && (
                                    <span className="opacity-50 mt-2 block whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </span>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
