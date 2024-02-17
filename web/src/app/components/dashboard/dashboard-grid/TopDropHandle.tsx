import React, { useRef } from "react";
import { HANDLE_WIDTH } from "./GridResizeHandle";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { ItemTypes } from "./DraggableChartContainer";

interface TopDropHandleProps {
  onDrop: (chartId: string) => void;
}

export const TopDropHandle: React.FC<TopDropHandleProps> = ({ onDrop }) => {
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

  return (
    <div
      ref={drop}
      className="w-full p-1 group"
      style={{
        height: HANDLE_WIDTH,
        cursor: "ns-resize",
      }}
    >
      <div
        className={`w-full h-full rounded-lg ${isOver ? "bg-accent-100/30" : ""}`}
      />
    </div>
  );
};
