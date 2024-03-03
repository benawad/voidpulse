import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
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
    > & { buttonType?: ButtonType; loading?: boolean }
  >
> = ({
  className,
  loading,
  disabled,
  children,
  buttonType = "default",
  ...props
}) => {
  return (
    <button
      className={
        buttonStyles[buttonType] +
        ` rounded-lg ${
          disabled
            ? ""
            : "hover:shadow-lg transition area transform ease-in duration-200"
        } p-3 relative ${className}`
      }
      disabled={disabled || loading}
      style={{
        filter: "brightness(90%)",
        transition: "filter 0.2s ease",
        color: loading ? "transparent" : "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(110%)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(90%)")}
      {...props}
    >
      {children}
      {loading ? (
        <div className="absolute w-full h-full justify-center items-center flex inset-0">
          <LoadingSpinner size={20} />
        </div>
      ) : null}
    </button>
  );
};
