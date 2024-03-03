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
import { genId } from "../../../utils/genId";

interface ChartsGridProps {
  charts: DbChart[];
  board: RouterOutput["getBoards"]["boards"][0];
}

export const ChartsGrid: React.FC<ChartsGridProps> = ({ board, charts }) => {
  const { mutateAsync } = useUpdateBoard();
  const divRef = useRef<HTMLDivElement>(null);
  const { boardId, projectId } = useProjectBoardContext();

  const [hoverInfo, setHoverInfo] = useState<null | {
    chartId: string;
    side: "left" | "right";
  }>(null);
  const [positions, setPositions] = React.useState<
    NonNullable<RouterOutput["createBoard"]["board"]["positions"]>
  >(board.positions || []);
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
      projectId,
      data: {
        positions,
      },
    });
  }, [positions]);

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
                .map((newRow) => ({
                  ...newRow,
                  cols: newRow.cols.filter((col) => col.chartId !== idToMove),
                }))
                .filter((newRow) => newRow.cols.length > 0);
              setPositions([
                {
                  rowId: genId(),
                  height: 400,
                  cols: [{ chartId: idToMove, width: 100 }],
                },
                ...newPositions,
              ]);
            }}
          />
        </div>
        {positions.map((row, rowIdx) => {
          if (!row?.cols?.length) {
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
              .map((newRow) => ({
                ...newRow,
                cols: newRow.cols.filter((col) => col.chartId !== idToMove),
              }))
              .filter((newRow) => newRow.cols.length > 0)
              .map((newRow) => {
                const dropIdx = newRow.cols.findIndex(
                  (x) => x.chartId === chartIdDroppedOn
                );
                if (dropIdx === -1) {
                  return newRow;
                } else if (side === "left") {
                  const newCols = [
                    ...newRow.cols.slice(0, dropIdx),
                    { chartId: idToMove, width: 100 },
                    ...newRow.cols.slice(dropIdx),
                  ];
                  return {
                    ...newRow,
                    cols: newCols.map((newCol) => ({
                      ...newCol,
                      width: Math.floor(100 / newCols.length),
                    })),
                  };
                } else if (side === "right") {
                  const newCols = [
                    ...newRow.cols.slice(0, dropIdx + 1),
                    { chartId: idToMove, width: 100 },
                    ...newRow.cols.slice(dropIdx + 1),
                  ];
                  return {
                    ...newRow,
                    cols: newCols.map((newCol) => ({
                      ...newCol,
                      width: Math.floor(100 / newCols.length),
                    })),
                  };
                }

                return newRow;
              });
            setPositions(newPositions);
          };

          return (
            <VerticalResizableRow
              onHeight={(height) => {
                setPositions((prev) => {
                  return prev.map((x, idx) => {
                    if (idx === rowIdx) {
                      return {
                        ...x,
                        height,
                      };
                    }
                    return x;
                  });
                });
              }}
              startingHeight={row.height}
              onDrop={(idToMove) => {
                const newPositions = positions
                  .map((newRow) => ({
                    ...newRow,
                    cols: newRow.cols.filter((col) => col.chartId !== idToMove),
                  }))
                  .filter((newRow) => newRow.cols.length > 0);
                setPositions([
                  ...newPositions.slice(0, rowIdx + 1),
                  {
                    rowId: genId(),
                    height: 400,
                    cols: [{ chartId: idToMove, width: 100 }],
                  },
                  ...newPositions.slice(rowIdx + 1),
                ]);
              }}
            >
              <div className="flex-1 h-full flex relative">
                <HorizontalResizableProvider
                  onWidths={(newWidths) => {
                    setPositions((prev) => {
                      return prev.map((w, idx) => {
                        if (idx === rowIdx) {
                          return {
                            ...w,
                            cols: w.cols.map((col, colIdx) => ({
                              ...col,
                              width: newWidths[colIdx],
                            })),
                          };
                        }
                        return w;
                      });
                    });
                  }}
                  startingWidths={row.cols.map((x) => x.width)}
                  numItems={row.cols.length}
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
                        row.cols[0].chartId === hoverInfo?.chartId &&
                        hoverInfo?.side === "left"
                      }
                      row={row.cols.map((x) => x.chartId)}
                      onDrop={(chartIdDropped) =>
                        onDrop(chartIdDropped, row.cols[0].chartId, "left")
                      }
                    />
                  </div>
                  {row.cols.map((col, k) => {
                    const chart = chartMap[col.chartId];

                    if (!chart) {
                      setPositions((prev) => {
                        const newPositions = prev.map(
                          (innerRow, innerRowIdx) => {
                            if (innerRowIdx !== rowIdx) {
                              return innerRow;
                            }
                            const newCols = innerRow.cols.filter(
                              (innerCol) => col.chartId !== innerCol.chartId
                            );
                            return {
                              ...innerRow,
                              cols: newCols.map((newCol) => ({
                                ...newCol,
                                width: Math.floor(100 / newCols.length),
                              })),
                            };
                          }
                        );

                        return newPositions.filter((row) => row.cols.length);
                      });
                      return null;
                    }

                    const highlightSeparator =
                      (hoverInfo?.chartId === chart.id &&
                        hoverInfo.side === "left") ||
                      (!!k &&
                        hoverInfo?.chartId === row.cols[k - 1].chartId &&
                        hoverInfo.side === "right");

                    return (
                      <React.Fragment key={chart.id}>
                        <MyPanel index={k}>
                          {k ? (
                            <GridResizeHandle
                              parentRef={divRef}
                              index={k - 1}
                              highlight={highlightSeparator}
                              row={row.cols.map((x) => x.chartId)}
                              onDrop={(chartIdDropped) =>
                                onDrop(chartIdDropped, chart.id, "left")
                              }
                            />
                          ) : null}
                          <DraggableChartContainer
                            row={row.cols.map((x) => x.chartId)}
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
                        row.cols[row.cols.length - 1].chartId ===
                          hoverInfo?.chartId && hoverInfo?.side === "right"
                      }
                      row={row.cols.map((x) => x.chartId)}
                      onDrop={(chartIdDropped) =>
                        onDrop(
                          chartIdDropped,
                          row.cols[row.cols.length - 1].chartId,
                          "right"
                        )
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
