import React, { useState, useCallback, useRef, FC, MouseEvent } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import { RouterOutput } from "../../utils/trpc";
import { Resizers } from "./Resizers";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";

interface Column {
  title: string;
  initialWidth: number;
}

interface DataItem {
  [key: string]: any; // Adjust the type according to your data structure
}

interface ResizableGridProps {
  breakdownPropName?: string;
  numRows: number;
  columns: Column[];
  datas: RouterOutput["getInsight"]["datas"];
}

export const ROW_HEIGHT = 35;

const ResizableGrid: FC<ResizableGridProps> = ({
  columns,
  datas,
  numRows,
  breakdownPropName,
}) => {
  const [{ visibleDataMap }, setState] = useChartStateContext();
  const [columnWidths, setColumnWidths] = useState<number[]>(
    columns.map((col) => col.initialWidth)
  );
  const gridRef = useRef<Grid>(null);

  return (
    <div>
      <Grid
        columnCount={columns.length}
        columnWidth={(index) => columnWidths[index]}
        height={numRows * ROW_HEIGHT}
        rowCount={numRows}
        rowHeight={() => ROW_HEIGHT}
        width={columnWidths.reduce((sum, width) => sum + width, 0)}
        ref={gridRef}
        style={{
          overflow: undefined,
        }}
      >
        {({ columnIndex, rowIndex, style }) => {
          let text = columns[columnIndex].title;
          let checkbox = null;
          if (rowIndex) {
            if (columnIndex === 0) {
              text = datas[rowIndex - 1].eventLabel;
            } else if (columnIndex === 1) {
              if (breakdownPropName) {
                const active = !visibleDataMap
                  ? rowIndex - 1 < 10
                  : !!visibleDataMap[datas[rowIndex - 1].id];
                checkbox = (
                  <button
                    onClick={() => {
                      const { id } = datas[rowIndex - 1];
                      if (!visibleDataMap) {
                        setState((prev) => {
                          const newVisibleDataMap: Record<string, boolean> = {};
                          for (let i = 0; i < Math.min(10, datas.length); i++) {
                            newVisibleDataMap[datas[i].id] = true;
                          }
                          newVisibleDataMap[id] = !active;
                          return {
                            ...prev,
                            visibleDataMap: newVisibleDataMap,
                          };
                        });
                      } else {
                        setState((prev) => ({
                          ...prev,
                          visibleDataMap: {
                            ...prev.visibleDataMap,
                            [id]: !active,
                          },
                        }));
                      }
                    }}
                    className="mr-2"
                  >
                    {active ? (
                      <MdCheckBox
                        size={20}
                        className="fill-secondary-signature-100"
                      />
                    ) : (
                      <MdCheckBoxOutlineBlank
                        size={20}
                        className="fill-primary-700"
                      />
                    )}
                  </button>
                );
                text = datas[rowIndex - 1].breakdown;
              } else {
                text = datas[rowIndex - 1].average_count.toLocaleString();
              }
            } else {
              text = datas[rowIndex - 1].average_count.toLocaleString();
            }
          }

          return (
            <div style={style}>
              <div
                className={`border-t flex text-primary-500 border-primary-700/50 bg-primary-900 px-2 py-2 truncate`}
              >
                {checkbox}
                {text}
              </div>
            </div>
          );
        }}
      </Grid>
      <Resizers
        columnWidths={columnWidths}
        gridRef={gridRef}
        setColumnWidths={setColumnWidths}
      />
    </div>
  );
};

export default ResizableGrid;
