import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: any) {
    // TODO: send to logging service
    console.error('Unhandled error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-4 text-muted-foreground">An unexpected error occurred. Try refreshing the page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
