import React, { useState } from "react";
import { EventEmitter } from "./useEventEmitter";

interface FunnelLabelsProps {
  data: any;
  $event: EventEmitter<
    {
      id: string;
      x: number;
      y: number;
    }[][]
  >;
}

export const FunnelLabels: React.FC<FunnelLabelsProps> = ({ $event, data }) => {
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
          const info = (data.datasets[datasetIndex] as any).inlineLabels?.[
            index
          ];

          if (!info) {
            return null;
          }

          return (
            <div
              key={pos.id}
              className="bg-primary-800 border border-primary-700 rounded-lg shadow-lg mono-body cursor-default"
              style={{
                position: "absolute",
                left: `${pos.x}px`,
                top: `${pos.y - 10}px`,
                transform: "translateX(-50%)", // Center horizontally
                padding: "4px 8px",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            >
              <div className="text-primary-100 text-center">
                {info.percent}%
              </div>
              <div className="text-primary-500 text-center">
                {info.value.toLocaleString()}
              </div>
            </div>
          );
        });
      })}
    </>
  );
};
