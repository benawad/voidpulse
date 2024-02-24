import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
type ButtonType = keyof typeof buttonStyles;

const buttonStyles = {
  action: "bg-accent-100  hover:bg-accent-100",
  negative: "bg-negative-100 hover:bg-negative-100",
  neutral:
    "accent-hover bg-primary-100/5 hover:shadow-none hover:border-primary-800",
  default: "bg-accent-100 hover:bg-accent-100",
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
        ` rounded-lg ${
          props.disabled
            ? ""
            : "hover:shadow-lg transition area transform ease-in duration-200"
        } p-3 ${className}`
      }
      style={{ filter: "brightness(90%)", transition: "filter 0.2s ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(110%)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(90%)")}
      {...props}
    />
  );
};
