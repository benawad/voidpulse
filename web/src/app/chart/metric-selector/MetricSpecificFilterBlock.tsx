import React from "react";
import { IoClose } from "react-icons/io5";

interface MetricSpecificFilterBlockProps {
  onDelete?: () => void;
}

export const MetricSpecificFilterBlock: React.FC<
  MetricSpecificFilterBlockProps
> = ({ onDelete }) => {
  return (
    <div>
      I am a new filter
      {onDelete ? (
        <div
          className="rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-secondary-red-100/20"
          onClick={onDelete}
        >
          <IoClose
            size={36}
            className="fill-primary-500 hover:fill-secondary-red-100 p-2"
          />
        </div>
      ) : null}
    </div>
  );
};
