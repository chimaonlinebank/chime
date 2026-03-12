import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface NotFoundProps {}

export const NotFound: React.FC<NotFoundProps> = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-lg bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-semibold mb-2">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-3 rounded-lg bg-[#00b388] text-white hover:bg-[#009670] transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
