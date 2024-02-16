import React, { useEffect, useMemo, useRef, useState } from "react";
import { useProjectBoardContext } from "../../../../../providers/ProjectBoardProvider";
import { RouterOutput, trpc } from "../../../utils/trpc";
import { ChartThumbnail } from "../ChartThumbnail";
import { GridResizeHandle } from "./GridResizeHandle";
import { VerticalResizableRow } from "./VerticalResizableRow";
import { DraggableChartContainer } from "./DraggableChartContainer";
import { New_Rocker } from "next/font/google";
import { HorizontalResizableProvider } from "./HorizontalResizableContext";
import { MyPanel } from "./MyPanel";

interface ChartsGridProps {}

type Chart = RouterOutput["getCharts"]["charts"][0];

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
    const _chartMap: Record<string, Chart> = {};
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
          return (
            <VerticalResizableRow>
              <div className="flex-1 h-full flex">
                <HorizontalResizableProvider numItems={row.length}>
                  {row.map((id, k) => {
                    const chart = chartMap[id];
                    const isHovered = hoverInfo?.chartId === chart.id;

                    if (!chart) {
                      return null;
                    }

                    return (
                      <React.Fragment key={chart.id}>
                        <MyPanel index={k}>
                          {k ? (
                            <GridResizeHandle
                              parentRef={divRef}
                              index={k - 1}
                            />
                          ) : null}
                          <DraggableChartContainer
                            row={row}
                            chartId={chart.id}
                            clearHover={() => setHoverInfo(null)}
                            onHover={(chartId, side) =>
                              setHoverInfo({ chartId, side })
                            }
                            onDrop={(idToMove, side) => {
                              if (idToMove === chart.id) {
                                return;
                              }
                              const newPositions = positions
                                .map((newRow) =>
                                  newRow.filter((currId) => currId !== idToMove)
                                )
                                .filter((newRow) => newRow.length > 0)
                                .map((newRow) => {
                                  const dropIdx = newRow.indexOf(id);
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
                            }}
                            classname={`w-full h-full ${isHovered && hoverInfo.side === "left" ? "border-l-4" : ""} ${isHovered && hoverInfo.side === "right" ? "border-r-4" : ""}`}
                          >
                            <ChartThumbnail chart={chart} />
                            {/* <div className="w-full h-full bg-blue-400" /> */}
                          </DraggableChartContainer>
                        </MyPanel>
                      </React.Fragment>
                    );
                  })}
                </HorizontalResizableProvider>
              </div>
            </VerticalResizableRow>
          );
        })}
      </div>
    </div>
  );
};
