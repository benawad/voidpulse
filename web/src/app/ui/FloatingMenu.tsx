import React from "react";

interface FloatingMenuProps {
  style?: React.CSSProperties;
  autoWidth?: boolean;
}

export const FloatingMenu: React.FC<
  React.PropsWithChildren<FloatingMenuProps>
> = ({ children, autoWidth, style }) => {
  return (
    <div
      className="p-1 ml-8 text-left bg-primary-800 border-primary-700 border rounded-lg shadow-xl "
      style={{ width: autoWidth ? undefined : 200, ...style }}
    >
      {children}
    </div>
  );
};
