import React, { useState } from "react";
import { IoClose, IoFilter } from "react-icons/io5";
import { MetricFilter } from "./Metric";

interface FilterBlockProps {
  onDelete?: () => void;
  onFilterChosen: (filter: MetricFilter) => void;
}

export const FilterBlock: React.FC<FilterBlockProps> = ({
  onDelete,
  onFilterChosen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex accent-hover justify-between items-center rounded-lg">
      <div className="flex flex-row group">
        <IoFilter className="fill-secondary-complement-100 mx-2" />
        <div className="text-sm">I am a new filter</div>
      </div>
      {/* Delete button shows up if it's an existing filter */}
      {onDelete || true ? (
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

      {/* Floating UI for choosing metric to add */}
      {isOpen ? null : null}
    </div>
  );
};
