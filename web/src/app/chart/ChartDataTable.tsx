import React from "react";
import { FixedSizeList as List } from "react-window";

interface ChartDataTableProps {}
interface RowProps {
  index: number;
  style: React.CSSProperties;
}

const Row: React.FC<RowProps> = ({ index, style }) => (
  <div
    className={`${index % 2 ? "ListItemOdd" : "ListItemEven"}`}
    style={style}
  >
    Row {index}
  </div>
);

const Example = () => (
  <List
    className="List"
    height={150}
    itemCount={1000}
    itemSize={35}
    width={"100%"}
  >
    {Row}
  </List>
);

export const ChartDataTable: React.FC<ChartDataTableProps> = ({}) => {
  return (
    <div>
      <Example />
    </div>
  );
};
