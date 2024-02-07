import React, { useCallback, useState, MouseEvent } from "react";
import { VariableSizeGrid } from "react-window";

interface ResizerProps {
  columnWidths: number[];
  setColumnWidths: React.Dispatch<React.SetStateAction<number[]>>;
  gridRef: React.RefObject<VariableSizeGrid<any>>;
}

export const Resizers: React.FC<ResizerProps> = ({
  columnWidths,
  gridRef,
  setColumnWidths,
}) => {
  const [activeColumn, setActiveColumn] = useState(-1);
  const onResize = useCallback((index: number, newWidth: number) => {
    setColumnWidths((current) => {
      const nextWidths = [...current];
      nextWidths[index] = newWidth;
      return nextWidths;
    });

    if (gridRef.current) {
      gridRef.current.resetAfterColumnIndex(index, true);
    }
  }, []);

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

  const onMouseDown = (index: number, e: MouseEvent<HTMLDivElement>) => {
    disableTextSelection();
    const startX = e.clientX;
    const startWidth = columnWidths[index];

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(startWidth + (moveEvent.clientX - startX), 50);
      onResize(index, newWidth);
    };

    const onMouseUp = () => {
      enableTextSelection();
      window.removeEventListener(
        "mousemove",
        onMouseMove as unknown as EventListener
      );
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener(
      "mousemove",
      onMouseMove as unknown as EventListener
    );
    window.addEventListener("mouseup", onMouseUp);
  };

  return columnWidths.map((_, index) => (
    <div
      key={index}
      className={
        activeColumn === index
          ? "bg-secondary-signature-100"
          : index === columnWidths.length - 1
          ? "bg-primary-600"
          : ""
      }
      style={{
        position: "absolute",
        top: 0,
        left:
          columnWidths.slice(0, index).reduce((acc, width) => acc + width, 0) +
          columnWidths[index] -
          1.5, // Adjust left position
        height: "100%",
        width: "3px",
        cursor: "col-resize",
        zIndex: 1,
      }}
      onMouseEnter={() => setActiveColumn(index)}
      onMouseLeave={() => setActiveColumn(-1)}
      onMouseDown={(e) => onMouseDown(index, e)}
    />
  ));
};
