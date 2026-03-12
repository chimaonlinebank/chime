import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

interface SectionWrapperProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, children, className = '' }) => (
  <section className={`mb-8 ${className}`}>
    {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}
    {children}
  </section>
);

interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const LayoutContainer: React.FC<LayoutContainerProps> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const colors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${colors[status]}`}>
      {label}
    </span>
  );
};
