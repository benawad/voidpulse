import { Table } from "@tanstack/react-table";
import React, { useEffect } from "react";

interface ResizerProps {
  columnWidths: number[];
  table: Table<any>;
}

const disableTextSelection = () => {
  // Add a class or directly set the style to disable text selection
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none"; // For Safari
};

const enableTextSelection = () => {
  // Remove the class or style to enable text selection
  document.body.style.userSelect = "";
  document.body.style.webkitUserSelect = ""; // For Safari
};

export const Resizers: React.FC<ResizerProps> = ({ columnWidths, table }) => {
  useEffect(() => {
    if (table.getState().columnSizingInfo.isResizingColumn) {
      disableTextSelection();
    } else {
      enableTextSelection();
    }
  }, [table.getState().columnSizingInfo.isResizingColumn]);

  return table.getFlatHeaders().map((header, index) => {
    return (
      <div
        key={index}
        className="px-2 group"
        style={{
          position: "absolute",
          top: 0,
          left:
            columnWidths
              .slice(0, index)
              .reduce((acc, width) => acc + width, 0) +
            columnWidths[index] -
            8, // Adjust left position
          height: "100%",

          width: "17px",
          cursor: "col-resize",
          zIndex: 1,
        }}
        onDoubleClick={() => header.column.resetSize()}
        onTouchStart={header.getResizeHandler()}
        onMouseDown={header.getResizeHandler()}
      >
        {/* Color of the bar inside the touch target shell */}
        <div
          className={`h-full w-full ${
            header.column.getIsResizing()
              ? "bg-secondary-signature-100"
              : index === columnWidths.length - 1
              ? "bg-primary-700 group-hover:bg-secondary-signature-100"
              : "bg-primary-700 group-hover:bg-secondary-signature-100"
          }`}
        ></div>
      </div>
    );
  });
};
