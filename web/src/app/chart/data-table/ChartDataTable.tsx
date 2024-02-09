import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DateHeader } from "@voidpulse/api";
import React, { useEffect } from "react";
import { RouterOutput } from "../../utils/trpc";
import ResizableGrid, { ROW_HEIGHT } from "./ResizableGrid";
import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual";

interface ChartDataTableProps {
  breakdownPropName?: string;
  datas: Extract<
    RouterOutput["getInsight"]["datas"],
    { average_count: number }[]
  >;
  dateHeaders: DateHeader[];
  highlightedRow?: string | null;
  setHighlightedRow: (rowId: string | null) => void;
}

const COLUMN_WIDTH = 100;

export const ChartDataTable: React.FC<ChartDataTableProps> = ({
  datas,
  breakdownPropName,
  dateHeaders,
  highlightedRow,
  setHighlightedRow,
}) => {
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const scrollMarginRef = React.useRef(0);

  useEffect(() => {
    if (divRef.current) {
      scrollMarginRef.current = divRef.current.getBoundingClientRect().top;
    }
  }, []);

  const table = useReactTable({
    data: datas,
    columns: dateHeaders.map((dateHeader) => {
      return {
        accessorFn: (row: any) => {
          return row.data[dateHeader.lookupValue];
        },
        header: dateHeader.label,
        size: COLUMN_WIDTH,
      };
    }),
    getCoreRowModel: getCoreRowModel(),
  });
  const { rows } = table.getRowModel();
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const visibleColumns = table.getVisibleLeafColumns();
  const columnVirtualizer = useVirtualizer({
    count: visibleColumns.length,
    estimateSize: (index) => visibleColumns[index].getSize(), //estimate width of each column for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    horizontal: true,
    overscan: 3, //how many columns to render on each side off screen each way (adjust this for performance)
  });
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT, //estimate row height for accurate scrollbar dragging
    overscan: 5,
    scrollMargin: scrollMarginRef.current,
  });
  const leftHeaders = [
    { title: "Event", initialWidth: 200, fn: (row: any) => row.eventLabel },
  ];
  if (breakdownPropName) {
    leftHeaders.push(
      {
        title: breakdownPropName,
        initialWidth: 200,
        fn: (row: any) => row.breakdown,
      },
      {
        title: "Average",
        fn: (row: any) => row.average_count,
        initialWidth: 100,
      }
    );
  } else {
    leftHeaders.push({
      title: "Average",
      fn: (row: any) => row.average_count,
      initialWidth: 100,
    });
  }

  const virtualColumns = columnVirtualizer.getVirtualItems();
  let virtualPaddingLeft: number | undefined;
  let virtualPaddingRight: number | undefined;

  if (columnVirtualizer && virtualColumns?.length) {
    virtualPaddingLeft = virtualColumns[0]?.start ?? 0;
    virtualPaddingRight =
      columnVirtualizer.getTotalSize() -
      (virtualColumns[virtualColumns.length - 1]?.end ?? 0);
  }

  return (
    <div ref={divRef}>
      <div ref={tableContainerRef} className="w-full flex overflow-x-auto pb-2">
        <div className="sticky left-0 z-10">
          <ResizableGrid
            scrollMargin={scrollMarginRef.current}
            columns={leftHeaders}
            breakdownPropName={breakdownPropName}
            datas={datas}
            highlightedRow={highlightedRow}
            setHighlightedRow={setHighlightedRow}
          />
        </div>
        <table style={{ display: "grid" }}>
          <thead
            style={{
              display: "grid",
              top: 0,
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ display: "flex", width: "100%" }}
              >
                {virtualPaddingLeft ? (
                  //fake empty column to the left for virtualization scroll padding
                  <th style={{ display: "flex", width: virtualPaddingLeft }} />
                ) : null}
                {virtualColumns.map((vc) => {
                  const header = headerGroup.headers[vc.index];
                  return (
                    <th
                      key={header.id}
                      style={{
                        display: "flex",
                        width: header.getSize(),
                      }}
                    >
                      <div
                        className={`select-none w-full justify-end flex text-primary-600 border-primary-700/50 font-normal font-mono text-sm bg-primary-900 px-2 py-2`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    </th>
                  );
                })}
                {virtualPaddingRight ? (
                  //fake empty column to the right for virtualization scroll padding
                  <th
                    style={{
                      display: "flex",
                      width: virtualPaddingRight,
                    }}
                  />
                ) : null}
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
              const visibleCells = row.getVisibleCells();

              return (
                <tr
                  key={row.id}
                  className="border-t border-primary-800 text-sm text-primary-200"
                  style={{
                    display: "flex",
                    position: "absolute",
                    transform: `translateY(${
                      virtualRow.start - rowVirtualizer.options.scrollMargin
                    }px)`, //this should always be a `style` as it changes on scroll
                    width: "100%",
                  }}
                  onMouseOver={() => {
                    setHighlightedRow(row.original.id);
                  }}
                >
                  {virtualPaddingLeft ? (
                    //fake empty column to the left for virtualization scroll padding
                    <td
                      style={{ display: "flex", width: virtualPaddingLeft }}
                    />
                  ) : null}
                  {virtualColumns.map((vc) => {
                    const cell = visibleCells[vc.index];
                    return (
                      <td
                        key={cell.id}
                        className={`${
                          row.original.id === highlightedRow
                            ? "bg-primary-800 text-primary-100"
                            : "bg-primary-900 text-primary-200"
                        } px-2 py-2 h-full flex justify-end items-center font-mono`}
                        style={{
                          height: ROW_HEIGHT,
                          display: "flex",
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                  {virtualPaddingRight ? (
                    //fake empty column to the right for virtualization scroll padding
                    <td
                      style={{ display: "flex", width: virtualPaddingRight }}
                    />
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
