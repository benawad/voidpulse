import React, { useRef, useState } from "react";
import { useHorizontalResizable } from "./HorizontalResizableContext";
import { ItemTypes } from "./DraggableChartContainer";
import { DropTargetMonitor, useDrop } from "react-dnd";

interface GridResizeHandleProps {
  parentRef: React.RefObject<HTMLDivElement>;
  index: number;
  highlight: boolean;
  onDrop: (chartId: string) => void;
  row: string[];
}

export const HANDLE_WIDTH = 15;

export const GridResizeHandle: React.FC<GridResizeHandleProps> = ({
  parentRef,
  index,
  highlight,
  onDrop,
  row,
}) => {
  const dropOnly = index === -1;
  const canDrop = (item: any) => {
    return row.length < 4 || row.includes(item.chartId);
  };
  const canDropRef = React.useRef(canDrop);
  canDropRef.current = canDrop;
  const handler = (item: any, __: DropTargetMonitor<any, unknown>) => {
    onDrop(item.chartId);
  };
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const [{ isOver, isValidDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CHART,
    canDrop: (item: any) => canDropRef.current(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isValidDrop: monitor.canDrop(),
    }),
    drop: (item: any, monitor) => handlerRef.current(item, monitor),
  }));
  const [dragging, setDragging] = useState(false);
  const { handleResize } = useHorizontalResizable();
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    let startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const parentWidth = parentRef.current!.getBoundingClientRect().width;
      const delta = ((moveEvent.clientX - startX) / parentWidth) * 100; // Convert pixels to percentage
      handleResize(index, delta);
      startX = moveEvent.clientX; // Update startX for the next move event
    };

    const handleMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={drop}
      style={{
        cursor: dropOnly ? undefined : "ew-resize",
        width: HANDLE_WIDTH,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="group"
      onMouseDown={dropOnly ? undefined : handleMouseDown}
    >
      <div
        className={`w-full h-full m-1 ${!dropOnly ? `group-hover:bg-accent-100/30` : ``} rounded-lg ${(isOver && isValidDrop) || dragging || highlight ? "bg-accent-100/30" : ""}`}
      />
    </div>
  );
};
