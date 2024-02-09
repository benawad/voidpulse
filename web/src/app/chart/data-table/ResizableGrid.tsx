import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import React, { FC } from "react";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { colorOrder } from "../../ui/charts/ChartStyle";
import { RouterOutput } from "../../utils/trpc";
import { Resizers } from "./Resizers";
import { genId } from "../../utils/genId";

interface Column {
  fn: (row: any) => any;
  title: string;
  initialWidth: number;
}

interface DataItem {
  [key: string]: any; // Adjust the type according to your data structure
}

interface ResizableGridProps {
  breakdownPropName?: string;
  columns: Column[];
  datas: Extract<
    RouterOutput["getInsight"]["datas"],
    { average_count: number }[]
  >;
  scrollMargin: number;
  highlightedRow?: string | null;
  setHighlightedRow: (rowId: string | null) => void;
}

export const ROW_HEIGHT = 35;

const ResizableGrid: FC<ResizableGridProps> = ({
  columns,
  datas,
  breakdownPropName,
  scrollMargin,
  highlightedRow,
  setHighlightedRow,
}) => {
  const table = useReactTable({
    data: datas,
    defaultColumn: {
      minSize: 60,
    },
    columns: columns.map((x, i) => {
      return {
        id: ["a", "b", "c"][i],
        accessorFn: x.fn,
        header: x.title,
        size: x.initialWidth,
      };
    }),
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });
  const { rows } = table.getRowModel();
  const { columnSizeVars, columnWidths } = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    const columnWidths: number[] = [];
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      const w = header.column.getSize();
      colSizes[`--col-${header.column.id}-size`] = w;
      columnWidths.push(w);
    }
    return { columnSizeVars: colSizes, columnWidths };
  }, [table.getState().columnSizingInfo]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT, //estimate row height for accurate scrollbar dragging
    overscan: 5,
    scrollMargin,
  });
  const [{ visibleDataMap }, setState] = useChartStateContext();

  return (
    <div className="">
      <table
        style={{
          ...columnSizeVars,
          display: "grid",
        }}
        className="bg-primary-900"
      >
        <thead
          style={{
            display: "grid",
            top: 0,
            zIndex: 1,
          }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} style={{ display: "flex", width: "100%" }}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    style={{
                      display: "flex",
                      width: `calc(var(--header-${header?.id}-size) * 1px)`,
                    }}
                    className="relative"
                  >
                    <div
                      className={`select-none w-full text-primary-600 text-sm font-mono font-normal bg-primary-900 px-4 py-2 `}
                    >
                      <div className="text-start truncate">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            display: "grid",
            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
            position: "relative", //needed for absolute positioning of rows
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                className="border-t border-primary-800"
                onMouseOver={() => {
                  setHighlightedRow(row.id);
                }}
                style={{
                  display: "flex",
                  position: "absolute",
                  transform: `translateY(${
                    virtualRow.start - rowVirtualizer.options.scrollMargin
                  }px)`, //this should always be a `style` as it changes on scroll
                  width: "100%",
                  zIndex: 1,
                }}
              >
                {row.getVisibleCells().map((cell, columnIndex) => {
                  const rowIndex = cell.row.index;
                  let text = columns[columnIndex].title;
                  let checkbox = null;
                  if (columnIndex === 0) {
                    text = datas[rowIndex].eventLabel;
                  } else if (columnIndex === 1) {
                    if (breakdownPropName) {
                      const active = !visibleDataMap
                        ? rowIndex < 10
                        : !!visibleDataMap[datas[rowIndex].id];
                      checkbox = (
                        <button
                          onClick={() => {
                            const { id } = datas[rowIndex];
                            if (!visibleDataMap) {
                              setState((prev) => {
                                const newVisibleDataMap: Record<
                                  string,
                                  boolean
                                > = {};
                                for (
                                  let i = 0;
                                  i < Math.min(10, datas.length);
                                  i++
                                ) {
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
                              fill={colorOrder[rowIndex % colorOrder.length]}
                            />
                          ) : (
                            <MdCheckBoxOutlineBlank
                              size={20}
                              fill={colorOrder[rowIndex % colorOrder.length]}
                            />
                          )}
                        </button>
                      );
                      text = datas[rowIndex].breakdown || "None";
                    } else {
                      text = datas[rowIndex].average_count.toLocaleString();
                    }
                  } else {
                    text = datas[rowIndex].average_count.toLocaleString();
                  }

                  return (
                    <td
                      key={cell.id}
                      style={{
                        height: ROW_HEIGHT,
                        display: "flex",
                        width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                        padding: 0,
                      }}
                    >
                      <div
                        className={`flex text-sm ${
                          rowIndex.toString() === highlightedRow
                            ? "bg-primary-800 text-primary-100"
                            : "bg-primary-900 text-primary-200"
                        } px-4 h-full items-center w-full font-mono`}
                      >
                        {checkbox}
                        <span className="truncate">{text}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <Resizers columnWidths={columnWidths} table={table} />
    </div>
  );
};

export default ResizableGrid;
