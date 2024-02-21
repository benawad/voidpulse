import React, { useEffect, useMemo, useRef, useState } from "react";
import { useProjectBoardContext } from "../../../../../providers/ProjectBoardProvider";
import { DbChart, RouterOutput, trpc } from "../../../utils/trpc";
import { DraggableChartContainer } from "./DraggableChartContainer";
import { GridResizeHandle, HANDLE_WIDTH } from "./GridResizeHandle";
import { HorizontalResizableProvider } from "./HorizontalResizableContext";
import { MyPanel } from "./MyPanel";
import { VerticalResizableRow } from "./VerticalResizableRow";
import { TopDropHandle } from "./TopDropHandle";
import { useUpdateBoard } from "../../../utils/useUpdateBoard";
import { debounce } from "../../../utils/debounce";

interface ChartsGridProps {
  charts: DbChart[];
  board: RouterOutput["getProjects"]["boards"][0];
}

export const ChartsGrid: React.FC<ChartsGridProps> = ({ board, charts }) => {
  const { mutateAsync } = useUpdateBoard();
  const divRef = useRef<HTMLDivElement>(null);
  const { boardId } = useProjectBoardContext();

  const [hoverInfo, setHoverInfo] = useState<null | {
    chartId: string;
    side: "left" | "right";
  }>(null);
  const [positions, setPositions] = React.useState<string[][]>(
    board.positions || []
  );
  const [heights, setHeights] = React.useState<number[]>(board.heights || []);
  const [widths, setWidths] = React.useState<number[][]>(board.widths || []);
  const chartMap = useMemo(() => {
    const _chartMap: Record<string, DbChart> = {};
    for (const chart of charts || []) {
      _chartMap[chart.id] = chart;
    }
    return _chartMap;
  }, [charts, positions]);

  const firstRender = useRef(true);
  const debouncedMutateAsync = useMemo(
    () => debounce(mutateAsync, 500),
    [mutateAsync]
  );
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    debouncedMutateAsync({
      id: boardId,
      data: {
        positions,
        heights,
        widths,
      },
    });
  }, [positions, widths, heights]);

  return (
    <div className="p-8 flex-1">
      <div ref={divRef} className="flex flex-col w-full relative">
        <div
          style={{
            top: -HANDLE_WIDTH,
          }}
          className="absolute w-full"
        >
          <TopDropHandle
            onDrop={(idToMove) => {
              const newPositions = positions
                .map((newRow) => newRow.filter((currId) => currId !== idToMove))
                .filter((newRow) => newRow.length > 0);
              setPositions([[idToMove], ...newPositions]);
            }}
          />
        </div>
        {positions.map((row, rowIdx) => {
          if (!row.length) {
            setPositions((prev) => prev.filter((_, idx) => idx !== rowIdx));
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
            <VerticalResizableRow
              onHeight={(height) => {
                setHeights((prevHeights) => {
                  return prevHeights.map((h, idx) => {
                    if (idx === rowIdx) {
                      return height;
                    }
                    return h;
                  });
                });
              }}
              startingHeight={heights[rowIdx] || 400}
              onDrop={(idToMove) => {
                const newPositions = positions
                  .map((newRow) =>
                    newRow.filter((currId) => currId !== idToMove)
                  )
                  .filter((newRow) => newRow.length > 0);
                setPositions([
                  ...newPositions.slice(0, rowIdx + 1),
                  [idToMove],
                  ...newPositions.slice(rowIdx + 1),
                ]);
              }}
            >
              <div className="flex-1 h-full flex relative">
                <HorizontalResizableProvider
                  onWidths={(newWidths) => {
                    setWidths((prevWidths) => {
                      return prevWidths.map((w, idx) => {
                        if (idx === rowIdx) {
                          return newWidths;
                        }
                        return w;
                      });
                    });
                  }}
                  startingWidths={widths[rowIdx]}
                  numItems={row.length}
                >
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
                      setPositions((prev) => {
                        const newPositions = prev.map((row) =>
                          row.filter((currId) => currId !== id)
                        );

                        return newPositions.filter((row) => row.length);
                      });
                      setWidths((prev) => {
                        if (row.length === 1) {
                          return [
                            ...prev.slice(0, rowIdx),
                            ...prev.slice(rowIdx + 1),
                          ];
                        }
                        return prev.map((x, wIdx) =>
                          rowIdx === wIdx
                            ? Array(row.length - 1).fill(
                                Math.floor(100 / (row.length - 1))
                              )
                            : x
                        );
                      });
                      if (row.length === 1) {
                        setHeights((prev) => {
                          return prev.filter((_, hIdx) => hIdx !== rowIdx);
                        });
                      }

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
