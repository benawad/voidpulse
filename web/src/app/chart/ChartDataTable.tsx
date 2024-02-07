import React from "react";
import { FixedSizeList as List } from "react-window";
import { RouterOutput } from "../utils/trpc";
import moment from "moment";
import { MdCheckBox } from "react-icons/md";
import { FloatingTrigger } from "../ui/FloatingTrigger";
import { FloatingTooltip } from "../ui/FloatingTooltip";

interface ChartDataTableProps {
  datas: RouterOutput["getInsight"]["datas"];
}
interface RowProps {
  index: number;
  style: React.CSSProperties;
}

export const ChartDataTable: React.FC<ChartDataTableProps> = ({ datas }) => {
  const cellStyle =
    "border-r border-t border-primary-700/50 px-2 py-2 bg-transparent h-full items-center w-36";
  const rowStyle =
    "flex flex-row accent-hover bg-transparent text-primary-100 rounded-lg";
  const eventLabelWidth = 250;
  const cellHeight = 40;

  // First show a static row on top with all the headers
  const HeaderRow: React.FC<RowProps> = ({ index, style }) => (
    <div
      className={
        "flex flex-row text-sm font-semibold text-primary-500 border-b border-primary-500"
      }
      style={style}
      key={"r" + index}
    >
      <div className={cellStyle} style={{ width: eventLabelWidth, border: 0 }}>
        Event
      </div>
      {datas[index]?.breakdown ? (
        <div className={cellStyle} style={{ border: 0 }}>
          Breakdown
        </div>
      ) : null}
      {/* Date */}
      {datas[index]?.data.map((data, i) => {
        if (data[i] === undefined) {
          return null;
        }
        return (
          <FloatingTrigger
            key={"d" + i}
            appearsOnHover
            placement={"top"}
            floatingContent={
              <FloatingTooltip>
                <div className="font-normal">
                  {moment(data[0]).format("MMMM Do, YYYY")}
                </div>
              </FloatingTooltip>
            }
          >
            <div className={`${cellStyle} text-left`} style={{ border: 0 }}>
              {moment(data[0]).format("MMM D")}
            </div>
          </FloatingTrigger>
        );
      })}
    </div>
  );

  // Then, dynamically render all the table's rows based on the data

  const Row: React.FC<RowProps> = ({ index, style }) => {
    const rowData = datas[index];
    const isFirstRow = index === 0;
    const isSameAsAbove =
      index > 0 && datas[index - 1].eventLabel === rowData.eventLabel;

    return (
      <div className={rowStyle} style={style}>
        {/* Leftmost two cells for the event name and breakdown ID */}
        {/* To create the illusion of merged cells, don't show the event label if it's the same as the one above */}

        <div
          className={`${cellStyle} ${index === 0 ? "pt-2" : ""}`}
          style={{
            width: eventLabelWidth,
            borderTop: isSameAsAbove ? 0 : "",
          }}
        >
          {isSameAsAbove ? null : rowData.eventLabel}
        </div>

        {/* Only show breakdown if it exists */}
        {rowData.breakdown || rowData.breakdown === 0 ? (
          <div
            className={`flex flex-row items-center ${cellStyle} ${
              index === 0 ? "pt-2" : ""
            }`}
          >
            <MdCheckBox size={20} className="fill-secondary-signature-100" />
            <div className="ml-2">{datas[index].breakdown}</div>
          </div>
        ) : null}

        {/* Right side of the table, displaying individual data for each date */}
        {rowData &&
          rowData.data.map((data, i) => {
            if (data[i] === undefined) {
              return null;
            }
            return (
              <div
                className={`cursor-text ${cellStyle} ${
                  index === 0 ? "pt-2" : ""
                }`}
                key={"i" + i}
              >
                {data[1]}
              </div>
            );
          })}
      </div>
    );
  };

  const DataTable = () => (
    <List
      className="List"
      height={200}
      itemCount={datas.length}
      itemSize={cellHeight}
      width={"100%"}
    >
      {Row}
    </List>
  );

  return (
    <div className="-z-10 ml-24">
      <HeaderRow index={0} style={{}} />
      <DataTable />
    </div>
  );
};
