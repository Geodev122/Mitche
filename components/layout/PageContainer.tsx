import * as React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, title, subtitle, className }) => {
  return (
    <div className={`container mx-auto p-4 ${className}`}>
      {(title || subtitle) && (
        <header className="text-center my-6">
          {title && <h1 className="text-3xl font-bold text-gray-800">{title}</h1>}
          {subtitle && <p className="text-md text-gray-500 mt-1">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
