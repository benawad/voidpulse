import React, { useRef, useState } from "react";
import { Input } from "./Input";

interface ValidatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onBlurSubmit: (value: string) => boolean;
}

export const ValidatingInput: React.FC<ValidatingInputProps> = ({
  value,
  onBlurSubmit,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value as string);
  const onDone = () => {
    if (onBlurSubmit(text)) {
      setText(text);
    } else {
      setText(value as string);
    }
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur();
      }}
    >
      <Input
        ref={inputRef}
        {...props}
        onBlur={onDone}
        value={text || ""}
        onChange={(e) => setText(e.target.value)}
        className="h-6 text-xs"
      />
    </form>
  );
};
