import React from 'react';

export const PremiumIcon = ({ className, ...props }: { className?: string, title?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className} 
    aria-hidden="true"
    {...props}
   >
    <path 
        fillRule="evenodd" 
        d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.681 3.468 3.82 1.033c.734.198.983 1.12.447 1.6l-2.768 2.7.773 3.99c.128.664-.585 1.173-1.189.855L10 14.35l-3.465 2.148c-.604.318-1.317-.19-1.189-.854l.774-3.99-2.768-2.7c-.536-.48-.287-1.402.447-1.6l3.82-1.033 1.681-3.468z" 
        clipRule="evenodd" 
    />
  </svg>
);