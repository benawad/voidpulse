import React from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { DateHeader } from "@voidpulse/api";
import { FloatingTooltip } from "../../ui/FloatingTooltip";
import { FloatingTrigger } from "../../ui/FloatingTrigger";
import { RouterOutput } from "../../utils/trpc";
import ResizableGrid, { ROW_HEIGHT } from "./ResizableGrid";

interface ChartDataTableProps {
  breakdownPropName?: string;
  datas: RouterOutput["getInsight"]["datas"];
  dateHeaders: DateHeader[];
}

const COLUMN_WIDTH = 100;

export const ChartDataTable: React.FC<ChartDataTableProps> = ({
  datas,
  breakdownPropName,
  dateHeaders,
}) => {
  const columns = dateHeaders.length;
  const numRows = datas.length + 1;
  const leftHeaders = [{ title: "Event", initialWidth: 200 }];
  if (breakdownPropName) {
    leftHeaders.push(
      { title: breakdownPropName, initialWidth: 200 },
      {
        title: "Average",
        initialWidth: 100,
      }
    );
  } else {
    leftHeaders.push({
      title: "Average",
      initialWidth: 100,
    });
  }
  const cellCn = `border-r border-t border-primary-700/50 bg-primary-1000 px-2 py-2 h-full flex items-center`;

  return (
    <div className="w-full flex overflow-x-auto pb-2">
      <div className="sticky left-0 z-10">
        <ResizableGrid
          numRows={numRows}
          columns={leftHeaders}
          breakdownPropName={breakdownPropName}
          datas={datas}
        />
      </div>
      <Grid
        columnCount={columns}
        columnWidth={COLUMN_WIDTH}
        height={ROW_HEIGHT * numRows}
        rowCount={numRows}
        rowHeight={ROW_HEIGHT}
        width={COLUMN_WIDTH * columns}
        style={{
          overflow: undefined,
        }}
      >
        {({ style, rowIndex, columnIndex }) => {
          const { label, lookupValue, fullLabel } = dateHeaders[columnIndex];
          let text = label;
          if (rowIndex) {
            text = "" + datas[rowIndex - 1].data[lookupValue]?.toLocaleString();
          }

          if (!rowIndex) {
            return (
              <div className={`${cellCn} z-0`} style={style}>
                <FloatingTrigger
                  portal
                  appearsOnHover
                  placement={"top"}
                  floatingContent={
                    <FloatingTooltip>
                      <div className="font-normal">{fullLabel}</div>
                    </FloatingTooltip>
                  }
                >
                  {text}
                </FloatingTrigger>
              </div>
            );
          } else {
            return (
              <div className={`${cellCn} z-0`} style={style}>
                {text}
              </div>
            );
          }
        }}
      </Grid>
    </div>
  );
};
