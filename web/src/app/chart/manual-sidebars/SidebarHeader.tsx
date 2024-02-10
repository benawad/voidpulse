import React from "react";
import { Kids } from "../../ui/FullScreenModalOverlay";

export const SidebarHeader: Kids<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`w-full p-2 my-2 rounded-md flex items-center group justify-between text-primary-300 text-xs mono-body ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
