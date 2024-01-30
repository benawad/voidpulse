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
      className={`bg-secondary-signature-100/70 rounded-lg hover:bg-secondary-signature-100 hover:shadow-lg transition-colors area p-3 ${className}`}
      {...props}
    />
  );
};
