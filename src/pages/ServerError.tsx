import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ServerErrorProps {}

export const ServerError: React.FC<ServerErrorProps> = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-lg bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-semibold mb-2">500 - Server Error</h1>
        <p className="text-muted-foreground mb-6">
          Something went wrong on our end. Our team has been notified.
        </p>
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

export default ServerError;
