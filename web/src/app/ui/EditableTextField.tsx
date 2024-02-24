import React, { useEffect, useRef, useState } from "react";
import { Input } from "./Input";
import { AiOutlineEdit } from "react-icons/ai";

interface EditableTextFieldProps {
  text: string;
  onDone: (text: string) => void;
  placeholder?: string;
  showEditIcon?: boolean;
}

export const EditableTextField: React.FC<EditableTextFieldProps> = ({
  placeholder,
  text: startingText,
  onDone,
  showEditIcon,
}) => {
  const startingTextRef = useRef(startingText);
  startingTextRef.current = startingText;

  const refOnDone = useRef(onDone);
  refOnDone.current = onDone;

  const [text, setText] = useState(startingText);
  const textRef = useRef(text);
  textRef.current = text;
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Happens when you click outside the input
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setIsEditingTitle(false);
        if (textRef.current.trim()) {
          refOnDone.current?.(textRef.current);
        } else {
          setText(startingTextRef.current || "Untitled");
        }
      }
    };
    //Checks if you are outside the input once your mouse moves
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Adjust the width based on the length of the input
  const inputStyle = {
    width: `${Math.min(20, Math.max(10, text.length))}ch`,
  };

  return isEditingTitle ? (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setIsEditingTitle(false);
        if (text.trim()) {
          onDone(text);
        } else {
          setText(startingText || "Untitled");
        }
      }}
    >
      <Input
        placeholder={placeholder}
        ref={inputRef}
        value={text}
        autoFocus
        style={inputStyle}
        onChange={(e) => {
          setText(e.target.value);
        }}
        className="-mt-1"
      />
    </form>
  ) : (
    <div
      className="hoverable area rounded-lg px-1 flex items-center"
      onClick={() => {
        setIsEditingTitle(true);
      }}
    >
      {text || placeholder}
      {showEditIcon ? <AiOutlineEdit className="ml-2 opacity-50" /> : null}
    </div>
  );
};
