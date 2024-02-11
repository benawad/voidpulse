import React, { useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import Chart, { ChartData } from "chart.js/auto";
import { colorOrder } from "./ChartStyle";

export const FunnelChart: React.FC<{
  data: ChartData<"bar", number[], string>;
}> = ({ data }) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;

      const startingIdx = chart.data.datasets.length / 2;
      for (let i = startingIdx; i < chart.data.datasets.length; i++) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(
          0,
          colorOrder[(i - startingIdx) % colorOrder.length] + "80"
        );
        gradient.addColorStop(1, "transparent");
        chart.data.datasets[i].backgroundColor = gradient;
      }
      chart.update();
    }
  }, [data]);

  // const data = {
  //   labels: ["Stage 1", "Stage 2", "Stage 3"],
  //   datasets: [
  //     {
  //       label: "Completed",
  //       data: [300, 200, 100], // number of people who completed each stage
  //       backgroundColor: colorOrder[0],
  //       stack: "stack1",
  //     },
  //     {
  //       label: "Completed2",
  //       data: [250, 150, 50],
  //       backgroundColor: colorOrder[1],
  //       stack: "stack2",
  //     },
  //     {
  //       label: "Dropped Off",
  //       data: [0, 100, 100], // number of people who dropped off after each stage
  //       backgroundColor: "",
  //       stack: "stack1",
  //     },
  //     {
  //       label: "Dropped Off2",
  //       data: [0, 100, 100],
  //       backgroundColor: "",
  //       stack: "stack2",
  //     },
  //   ],
  // };

  return (
    <Bar
      ref={chartRef}
      data={data}
      options={{
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
        backgroundColor: "transparent",
      }}
    />
  );
};
