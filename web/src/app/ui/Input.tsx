import React, { DetailedHTMLProps, InputHTMLAttributes } from "react";

export const Input: React.FC<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = ({ className, ...props }) => {
  return (
    <input
      className={`rounded-md w-full bg-primary-800 p-2 m-1 hover:bg-primary-700 focus:bg-primary-700 hover:border-primary-600 focus:border-primary-600 focus-glow border border-transparent ${className}`}
      {...props}
    />
  );
};
