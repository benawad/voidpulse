import React from "react";
import { useHorizontalResizable } from "./HorizontalResizableContext";

interface GridResizeHandleProps {
  parentRef: React.RefObject<HTMLDivElement>;
  index: number;
}

export const HANDLE_WIDTH = 13;

export const GridResizeHandle: React.FC<GridResizeHandleProps> = ({
  parentRef,
  index,
}) => {
  const { handleResize } = useHorizontalResizable();
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    let startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const parentWidth = parentRef.current!.getBoundingClientRect().width;
      const delta = ((moveEvent.clientX - startX) / parentWidth) * 100; // Convert pixels to percentage
      handleResize(index, delta);
      startX = moveEvent.clientX; // Update startX for the next move event
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      style={{
        cursor: "ew-resize",
        width: HANDLE_WIDTH,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseDown={handleMouseDown}
    ></div>
  );
};
