import React from 'react';

interface SkipliLogoProps {
  className?: string;
  size?: number;
}

export const SkipliLogo: React.FC<SkipliLogoProps> = ({ className = 'h-8 w-auto', size }) => {
  return (
    <img
      src="/Skipli_logo_blue.png"
      alt="Skipli Logo"
      className={`object-contain shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    />
  );
};

export default SkipliLogo;
