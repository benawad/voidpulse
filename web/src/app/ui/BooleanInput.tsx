import React from "react";

interface BooleanInputProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const BooleanInput: React.FC<BooleanInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex">
      <button
        onClick={() => {
          onChange(true);
        }}
        className={`rounded-l-md bg-primary-900 px-4 py-2  ${
          !!value
            ? "bg-accent-100 text-primary-100"
            : "hover:bg-primary-800 text-primary-400"
        }`}
      >
        True
      </button>
      <button
        onClick={() => {
          onChange(false);
        }}
        className={`rounded-r-md bg-primary-900 px-4 py-2  ${
          !value
            ? "bg-accent-100 text-primary-100"
            : "hover:bg-primary-800 text-primary-400"
        }`}
      >
        False
      </button>
    </div>
  );
};
