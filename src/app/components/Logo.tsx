import React from 'react';

interface LogoProps {
  className?: string;
  innerClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', innerClassName = 'text-white font-bold' }) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <span className={innerClassName}>C</span>
    </div>
  );
};

export default Logo;
