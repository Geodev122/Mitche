import * as React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // TODO: send to monitoring/logging service
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4] p-6">
          <div className="max-w-md text-center bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">An unexpected error occurred. Try refreshing the page or come back later.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-amber-600 text-white rounded">Refresh</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
