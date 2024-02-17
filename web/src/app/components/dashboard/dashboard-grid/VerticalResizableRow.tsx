import React, { useState } from "react";
import { Kids } from "../../../ui/FullScreenModalOverlay";
import { HANDLE_WIDTH } from "./GridResizeHandle";

const minHeight = 400;
const maxHeight = 800;

export const VerticalResizableRow: Kids<{}> = ({ children }) => {
  const [height, setHeight] = useState<number>(minHeight);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const divRef = React.useRef<HTMLDivElement>(null);

  const startResizing = (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);

    // Disable text selection during resize
    document.addEventListener("selectstart", preventTextSelection);
  };

  const preventTextSelection = (event: Event) => {
    event.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.removeEventListener("selectstart", preventTextSelection);
  };

  const resize = (mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      // Calculate new height based on mouse position
      const newHeight =
        mouseMoveEvent.clientY - divRef.current!.getBoundingClientRect().top;

      // Apply constraints
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setHeight(newHeight);
      }
    }
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  return (
    <div
      ref={divRef}
      style={{
        height: `${height}px`,
        position: "relative",
      }}
      className="flex flex-col"
    >
      {children}
      <div
        className="w-full p-1 group"
        style={{
          height: HANDLE_WIDTH,
          cursor: "ns-resize",
        }}
        onMouseDown={startResizing}
      >
        <div
          className={`w-full h-full group-hover:bg-accent-100/30 rounded-lg ${isResizing ? "bg-accent-100/30" : ""}`}
        />
      </div>
    </div>
  );
};
