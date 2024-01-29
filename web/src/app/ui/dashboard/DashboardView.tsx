import React from "react";
import { ChartThumbnail } from "./ChartThumbnail";
import { placeholderCharts } from "../charts/PlaceholderChartData";
import { trpc } from "../../utils/trpc";
import { Button } from "../Button";
import Link from "next/link";

interface DashboardViewProps {}
let charts = placeholderCharts;

export const DashboardView: React.FC<DashboardViewProps> = ({}) => {
  const { data, isLoading } = trpc.getProjects.useQuery();
  const { data: boardData, isLoading: loadingBoards } = trpc.getBoards.useQuery(
    { projectId: data?.projects[0].id! },
    {
      enabled: !!data?.projects[0].id,
    }
  );

  if (isLoading || loadingBoards) {
    return null;
  }

  if (!boardData?.boards) {
    return null;
  }

  const board = boardData.boards[0];

  return (
    <div>
      <div className="py-6">
        <div className="text-2xl font-bold sticky py-1">{board.name}</div>
        <div className="text-xs subtext">Here are our main charts.</div>
      </div>
      <Link href="/chart">Add chart</Link>
      <div className="grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left overscroll-none">
        {charts.map((chart) => {
          return (
            <div key={chart.title} className="m-2">
              <ChartThumbnail
                title={chart.title}
                subtitle={chart.subtitle}
                chartType={chart.chartType}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
