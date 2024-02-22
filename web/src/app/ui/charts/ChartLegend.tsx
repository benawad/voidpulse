import React, { useEffect, useState } from "react";
import { FloatingTrigger } from "../FloatingTrigger";
import { FloatingMenu } from "../FloatingMenu";

interface ChartLegendProps {
  width: number;
  labels: string[];
  colors: string[];
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  labels,
  colors,
  width,
}) => {
  const [visibleCount, setVisibleCount] = useState(() => {
    return Math.min(Math.floor(width / 100), labels.length);
  });

  useEffect(() => {
    setVisibleCount(Math.min(Math.floor(width / 100), labels.length));
  }, [width, labels.length]);

  let numItems = visibleCount;
  if (visibleCount < labels.length) {
    numItems += 1;
  }
  const maxWidth = Math.floor(100 / numItems) + "%";

  return (
    <div
      style={{
        height: 24,
      }}
      className="flex w-full justify-center px-4 items-center relative"
    >
      <div className="absolute w-full h-full flex justify-center items-center">
        {labels.slice(0, visibleCount).map((label, i) => {
          return (
            <div
              style={{
                maxWidth,
              }}
              key={i + label}
              className="flex bg-primary-700/50 rounded-md px-2 py-1 m-1"
            >
              <div
                className="rounded-sm h-3 w-3 my-auto"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <div className="ml-2 text-primary-200 text-xs truncate">
                {label}
              </div>
            </div>
          );
        })}
        {visibleCount < labels.length && (
          <div
            style={{
              width: maxWidth,
            }}
            className="text-xs text-primary-200 ml-2"
          >
            <FloatingTrigger
              appearsOnHover
              placement={"bottom-end"}
              portal
              floatingContent={
                <FloatingMenu autoWidth>
                  {labels.slice(visibleCount).map((label, i) => {
                    return (
                      <div
                        key={i + label}
                        className="flex rounded-md px-2 py-1 m-1 mb-2"
                      >
                        <div
                          className="rounded-sm h-3 w-3 my-auto"
                          style={{
                            backgroundColor:
                              colors[(i + visibleCount) % colors.length],
                          }}
                        />
                        <div className="ml-2 text-primary-200 text-xs truncate">
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </FloatingMenu>
              }
            >
              <div>{`${labels.length - visibleCount} Next`}</div>
            </FloatingTrigger>
          </div>
        )}
      </div>
    </div>
  );
};
