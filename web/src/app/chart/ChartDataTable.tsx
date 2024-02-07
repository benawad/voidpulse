import React from "react";
import { FixedSizeList as List } from "react-window";
import { RouterOutput } from "../utils/trpc";
import moment from "moment";
import { MdCheckBox } from "react-icons/md";

interface ChartDataTableProps {
  datas: RouterOutput["getInsight"]["datas"];
}
interface RowProps {
  index: number;
  style: React.CSSProperties;
}

export const ChartDataTable: React.FC<ChartDataTableProps> = ({ datas }) => {
  const cellStyle =
    "border-r border-primary-700 px-2 py-2 bg-transparent h-full items-center";
  const rowStyle =
    "flex flex-row accent-hover border-b border-primary-700 bg-transparent";

  const HeaderRow: React.FC<RowProps> = ({ index, style }) => (
    <div className={rowStyle} style={style}>
      <div className="opacity-10">row {index}</div>
      <div className={cellStyle}>Event Label</div>
      {datas[index].breakdown ? (
        <div className={cellStyle}>Breakdown</div>
      ) : null}
      {datas[index].data.map((data, i) => {
        // Data can be either an array or an object.
        if (Array.isArray(data)) {
          if (data[i] === undefined) {
            return null;
          }
          return (
            <div className={cellStyle}>{moment(data[0]).format("MMM DD")}</div>
          );
        } else if (typeof data === "object") {
          return (
            <div className={cellStyle}>{moment(data.day).format("MMM DD")}</div>
          );
        }
      })}
    </div>
  );

  const Row: React.FC<RowProps> = ({ index, style }) => (
    <div className={rowStyle} style={style}>
      <div className="opacity-10">row {index}</div>
      <div className={cellStyle}>{datas[index].eventLabel}</div>
      {datas[index].breakdown || datas[index].breakdown === 0 ? (
        <div className={`flex flex-row items-center ${cellStyle}`}>
          <MdCheckBox size={20} className="fill-secondary-signature-100" />
          <div className="ml-2">{datas[index].breakdown}</div>
        </div>
      ) : null}

      {datas[index] &&
        datas[index].data.map((data, i) => {
          // Data can be either an array or an object.
          if (Array.isArray(data)) {
            if (data[i] === undefined) {
              return null;
            }
            return <div className={cellStyle}>{data[1]}</div>;
          } else if (typeof data === "object") {
            return <div className={cellStyle}>{data.count}</div>;
          }
        })}
    </div>
  );

  const DataTable = () => (
    <List
      className="List"
      height={200}
      itemCount={datas.length}
      itemSize={40}
      width={"100%"}
    >
      {Row}
    </List>
  );

  return (
    <div className="-z-10">
      <HeaderRow index={0} style={{}} />
      <DataTable />
    </div>
  );
};
