import React, { useEffect, useState } from "react";
import { EventEmitter } from "./useEventEmitter";
import { numFormatter } from "../../utils/numFormatter";

interface BarLabelsProps {
  data: any;
  $event: EventEmitter<
    {
      id: string;
      x: number;
      y: number;
    }[][]
  >;
}

export const BarLabels: React.FC<BarLabelsProps> = ({ $event, data }) => {
  const [labelPositions, setLabelPositions] = useState<
    {
      id: string;
      x: number;
      y: number;
    }[][]
  >([]);
  $event.useSubscription((positions) => {
    setLabelPositions(positions);
  });

  return (
    <>
      {labelPositions.map((positions, datasetIndex) => {
        return positions.map((pos, index) => {
          return (
            <div
              key={pos.id}
              className="mono-body cursor-default"
              style={{
                position: "absolute",
                left: `${pos.x}px`,
                top: `${pos.y - 12}px`,
                padding: "4px 8px",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            >
              {numFormatter.format(data.datasets[datasetIndex].data[index])}
            </div>
          );
        });
      })}
    </>
  );
};
