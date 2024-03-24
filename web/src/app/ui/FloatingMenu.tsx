import React from "react";

interface FloatingMenuProps {
  style?: React.CSSProperties;
  autoWidth?: boolean;
  className?: string;
}

export const FloatingMenu: React.FC<
  React.PropsWithChildren<FloatingMenuProps>
> = ({ children, autoWidth, style, className = "" }) => {
  return (
    <div
      className={`bg-primary-800 border-primary-700 soft-entrance p-1 ml-8 text-left border rounded-lg shadow-xl ${className}`}
      style={{ width: autoWidth ? undefined : 200, ...style }}
    >
      {children}
    </div>
  );
};
