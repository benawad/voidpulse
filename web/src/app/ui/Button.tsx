import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
type ButtonType = keyof typeof buttonStyles;

const buttonStyles = {
  action: "bg-secondary-signature-100/70  hover:bg-secondary-signature-100",
  negative: "bg-secondary-red-100/70 hover:bg-secondary-red-100",
  neutral:
    "accent-hover bg-primary-100/5 hover:shadow-none hover:border-primary-800",
  default: "bg-secondary-signature-100/70 hover:bg-secondary-signature-100",
};

export const Button: React.FC<
  React.PropsWithChildren<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > & { buttonType?: ButtonType }
  >
> = ({ className, buttonType = "default", ...props }) => {
  return (
    <button
      className={
        buttonStyles[buttonType] +
        ` rounded-lg hover:shadow-lg transition-colors area p-3 ${className}`
      }
      {...props}
    />
  );
};
