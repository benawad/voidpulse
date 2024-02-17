import React, { useEffect, useMemo, useRef, useState } from "react";
import { useProjectBoardContext } from "../../../../../providers/ProjectBoardProvider";
import { DbChart, RouterOutput, trpc } from "../../../utils/trpc";
import { ChartThumbnail } from "../ChartThumbnail";
import { GridResizeHandle, HANDLE_WIDTH } from "./GridResizeHandle";
import { VerticalResizableRow } from "./VerticalResizableRow";
import { DraggableChartContainer } from "./DraggableChartContainer";
import { New_Rocker } from "next/font/google";
import { HorizontalResizableProvider } from "./HorizontalResizableContext";
import { MyPanel } from "./MyPanel";

interface ChartsGridProps {}

export const ChartsGrid: React.FC<ChartsGridProps> = ({}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const { boardId, projectId } = useProjectBoardContext();
  const { data } = trpc.getCharts.useQuery({
    boardId,
    projectId,
  });
  const [hoverInfo, setHoverInfo] = useState<null | {
    chartId: string;
    side: "left" | "right";
  }>(null);
  const [positions, setPositions] = React.useState<string[][]>([]);
  const chartMap = useMemo(() => {
    const _chartMap: Record<string, DbChart> = {};
    for (const chart of data?.charts || []) {
      _chartMap[chart.id] = chart;
    }
    return _chartMap;
  }, [data, positions]);

  useEffect(() => {
    if (data && !positions.length) {
      const posRows: string[][] = [];
      let tmpRow: string[] = [];
      for (const chart of data?.charts || []) {
        if (tmpRow.length === 4) {
          posRows.push(tmpRow);
          tmpRow = [];
        } else {
          tmpRow.push(chart.id);
        }
      }
      if (tmpRow.length > 0) {
        posRows.push(tmpRow);
      }
      setPositions(posRows);
    }
  }, [data]);

  if (!positions.length) {
    return null;
  }

  return (
    <div className="p-8 flex-1">
      <div ref={divRef} className="flex flex-col w-full">
        {positions.map((row, i) => {
          if (!row.length) {
            return null;
          }

          const onDrop = (
            idToMove: string,
            chartIdDroppedOn: string,
            side: "left" | "right"
          ) => {
            if (idToMove === chartIdDroppedOn) {
              return;
            }
            const newPositions = positions
              .map((newRow) => newRow.filter((currId) => currId !== idToMove))
              .filter((newRow) => newRow.length > 0)
              .map((newRow) => {
                const dropIdx = newRow.indexOf(chartIdDroppedOn);
                if (dropIdx === -1) {
                  return newRow;
                } else if (side === "left") {
                  return [
                    ...newRow.slice(0, dropIdx),
                    idToMove,
                    ...newRow.slice(dropIdx),
                  ];
                } else if (side === "right") {
                  return [
                    ...newRow.slice(0, dropIdx + 1),
                    idToMove,
                    ...newRow.slice(dropIdx + 1),
                  ];
                }

                return newRow;
              });
            setPositions(newPositions);
          };

          return (
            <VerticalResizableRow>
              <div className="flex-1 h-full flex relative">
                <HorizontalResizableProvider numItems={row.length}>
                  <div
                    style={{
                      left: -HANDLE_WIDTH,
                    }}
                    className="absolute h-full"
                  >
                    <GridResizeHandle
                      parentRef={divRef}
                      index={-1}
                      highlight={
                        row[0] === hoverInfo?.chartId &&
                        hoverInfo?.side === "left"
                      }
                      row={row}
                      onDrop={(chartIdDropped) =>
                        onDrop(chartIdDropped, row[0], "left")
                      }
                    />
                  </div>
                  {row.map((id, k) => {
                    const chart = chartMap[id];

                    if (!chart) {
                      return null;
                    }

                    const highlightSeparator =
                      (hoverInfo?.chartId === chart.id &&
                        hoverInfo.side === "left") ||
                      (!!k &&
                        hoverInfo?.chartId === row[k - 1] &&
                        hoverInfo.side === "right");

                    return (
                      <React.Fragment key={chart.id}>
                        <MyPanel index={k}>
                          {k ? (
                            <GridResizeHandle
                              parentRef={divRef}
                              index={k - 1}
                              highlight={highlightSeparator}
                              row={row}
                              onDrop={(chartIdDropped) =>
                                onDrop(chartIdDropped, chart.id, "left")
                              }
                            />
                          ) : null}
                          <DraggableChartContainer
                            row={row}
                            chart={chart}
                            clearHover={() => setHoverInfo(null)}
                            onHover={(chartId, side) =>
                              setHoverInfo({ chartId, side })
                            }
                            onDrop={(chartIdDropped, side) =>
                              onDrop(chartIdDropped, chart.id, side)
                            }
                            classname={`w-full h-full`}
                          />
                        </MyPanel>
                      </React.Fragment>
                    );
                  })}
                  <div
                    style={{
                      right: -HANDLE_WIDTH,
                    }}
                    className="absolute h-full"
                  >
                    <GridResizeHandle
                      parentRef={divRef}
                      index={-1}
                      highlight={
                        row[row.length - 1] === hoverInfo?.chartId &&
                        hoverInfo?.side === "right"
                      }
                      row={row}
                      onDrop={(chartIdDropped) =>
                        onDrop(chartIdDropped, row[row.length - 1], "right")
                      }
                    />
                  </div>
                </HorizontalResizableProvider>
              </div>
            </VerticalResizableRow>
          );
        })}
      </div>
    </div>
  );
};
