import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export const Button: React.FC<
  React.PropsWithChildren<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  >
> = ({ className, ...props }) => {
  return (
    <button
      className={`bg-secondary-main-100/70 rounded-lg hover:bg-secondary-main-100 hover:shadow-lg transition-colors area p-4 ${className}`}
      {...props}
    />
  );
};
