import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-background text-foreground ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer; 