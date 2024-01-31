import React, { DetailedHTMLProps, InputHTMLAttributes } from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`rounded-md w-full bg-primary-800 p-2 my-1 hover:bg-primary-700 focus:bg-primary-700 hover:border-primary-600 focus:border-primary-600 focus-glow border border-transparent ${className}`}
      {...props}
    ></input>
  );
});
