import React, { useEffect, useRef } from "react";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { Kids } from "../../../ui/FullScreenModalOverlay";
import { usePrevious } from "../../../utils/usePrevious";
import { DbChart } from "../../../utils/trpc";
import { ChartThumbnail } from "../ChartThumbnail";

export enum ItemTypes {
  CHART = "CHART",
}

export const DraggableChartContainer: Kids<{
  classname?: string;
  row: string[];
  onDrop: (id: string, side: "left" | "right") => void;
  onHover: (id: string, side: "left" | "right") => void;
  clearHover: () => void;
  chart: DbChart;
}> = ({ children, classname, onDrop, row, chart, onHover, clearHover }) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const canDrop = (item: any) => row.length < 4 || row.includes(item.chartId);
  const canDropRef = React.useRef(canDrop);
  canDropRef.current = canDrop;
  const handler = (
    item: any,
    monitor: DropTargetMonitor<any, unknown>,
    isHover: boolean
  ) => {
    const dropTargetElement = divRef.current!.getBoundingClientRect();
    const dropOffset = monitor.getClientOffset();

    if (!dropOffset || item.chartId === chart.id || !monitor.canDrop()) {
      return;
    }

    const dropSide =
      dropOffset.x < dropTargetElement.left + dropTargetElement.width / 2
        ? "left"
        : "right";

    if (isHover) {
      onHover(chart.id, dropSide);
    } else {
      onDrop(item.chartId, dropSide);
    }
  };
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CHART,
    canDrop: (item: any) => canDropRef.current(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover: (item: any, monitor) => handlerRef.current(item, monitor, true),
    drop: (item: any, monitor) => handlerRef.current(item, monitor, false),
  }));
  const [{ opacity }, dragRef, dragPreview] = useDrag(
    () => ({
      type: ItemTypes.CHART,
      item: {
        chartId: chart.id,
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
        dragPreview(r);
        // @ts-expect-error
        divRef.current = r;
      }}
      style={{ opacity }}
    >
      <div className="w-full h-full" ref={drop}>
        <ChartThumbnail chart={chart} dragRef={dragRef} />
      </div>
    </div>
  );
};
