import React, { useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Kids } from "../../../ui/FullScreenModalOverlay";
import { usePrevious } from "../../../utils/usePrevious";

export enum ItemTypes {
  CHART = "CHART",
}

export const DraggableChartContainer: Kids<{
  classname?: string;
  chartId: string;
  row: string[];
  onDrop: (id: string, side: "left" | "right") => void;
  onHover: (id: string, side: "left" | "right") => void;
  clearHover: () => void;
}> = ({ children, classname, onDrop, row, chartId, onHover, clearHover }) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const canDropRef = React.useRef(
    (item: any) => row.length < 4 || row.includes(item.chartId)
  );
  canDropRef.current = (item: any) =>
    row.length < 4 || row.includes(item.chartId);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CHART,
    canDrop: (item: any) => canDropRef.current(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover: (item: any, monitor) => {
      const dropTargetElement = divRef.current!.getBoundingClientRect();
      const dropOffset = monitor.getClientOffset();

      if (!dropOffset || item.chartId === chartId || !monitor.canDrop()) {
        return;
      }

      const dropSide =
        dropOffset.x < dropTargetElement.left + dropTargetElement.width / 2
          ? "left"
          : "right";

      onHover(chartId, dropSide);
    },
    drop: (item: any, monitor) => {
      const dropTargetElement = divRef.current!.getBoundingClientRect();
      const dropOffset = monitor.getClientOffset();

      if (!dropOffset) {
        return;
      }

      const dropSide =
        dropOffset.x < dropTargetElement.left + dropTargetElement.width / 2
          ? "left"
          : "right";

      onDrop(item.chartId, dropSide);
    },
  }));
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.CHART,
      item: {
        chartId,
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    []
  );

  const clearHoverRef = React.useRef(clearHover);
  clearHoverRef.current = clearHover;
  const prevIsHovered = usePrevious(isOver);
  useEffect(() => {
    if (!isOver && prevIsHovered) {
      clearHoverRef.current();
    }
  }, [isOver]);

  return (
    <div
      className={classname}
      ref={(r) => {
        dragRef(r);
        // @ts-expect-error
        divRef.current = r;
      }}
      style={{ opacity }}
    >
      <div className="w-full h-full" ref={drop}>
        {children}
      </div>
    </div>
  );
};
