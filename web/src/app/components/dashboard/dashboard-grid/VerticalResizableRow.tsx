import React, { useMemo, useRef, useState } from "react";
import { Kids } from "../../../ui/FullScreenModalOverlay";
import { HANDLE_WIDTH } from "./GridResizeHandle";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { ItemTypes } from "./DraggableChartContainer";
import { debounce } from "../../../utils/debounce";

const minHeight = 400;
const maxHeight = 800;

export const VerticalResizableRow: Kids<{
  startingHeight: number;
  onHeight: (height: number) => void;
  onDrop: (chartId: string) => void;
}> = ({ children, onDrop, startingHeight, onHeight }) => {
  const handler = (item: any, __: DropTargetMonitor<any, unknown>) => {
    onDrop(item.chartId);
  };
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CHART,
    canDrop: (item: any) => true,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    drop: (item: any, monitor) => handlerRef.current(item, monitor),
  }));
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [height, setHeight] = useState(startingHeight);
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

  const onHeightRef = useRef(onHeight);
  onHeightRef.current = onHeight;
  const debouncedOnHeight = useMemo(
    () => debounce((h: number) => onHeightRef.current(h), 500),
    []
  );
  const resize = (mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      // Calculate new height based on mouse position
      const newHeight =
        mouseMoveEvent.clientY - divRef.current!.getBoundingClientRect().top;

      // Apply constraints
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setHeight(newHeight);
        debouncedOnHeight(newHeight);
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
        ref={drop}
        className="w-full p-1 group"
        style={{
          height: HANDLE_WIDTH,
          cursor: "ns-resize",
        }}
        onMouseDown={startResizing}
      >
        <div
          className={`w-full h-full group-hover:bg-accent-100/30 rounded-lg ${isOver || isResizing ? "bg-accent-100/30" : ""}`}
        />
      </div>
    </div>
  );
};
