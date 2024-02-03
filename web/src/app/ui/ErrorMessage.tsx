import { HTMLAttributes } from "react";

interface ErrorMessageProps extends HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ ...props }) => {
  return <pre {...props} className={`text-red-500 ${props.className}`} />;
};
