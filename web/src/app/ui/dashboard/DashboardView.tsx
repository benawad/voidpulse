import React from "react";
import { ChartThumbnail } from "./ChartThumbnail";
import { placeholderCharts } from "../charts/PlaceholderChartData";
import { trpc } from "../../utils/trpc";
import { Button } from "../Button";
import Link from "next/link";
import { DashboardStickyHeader } from "./DashboardStickyHeader";
import { DashboardNavigator } from "./DashboardNavigator";
import { HeaderNav } from "../HeaderNav";

interface DashboardViewProps {}
let charts = placeholderCharts;

export const DashboardView: React.FC<DashboardViewProps> = ({}) => {
  const { data, isLoading } = trpc.getProjects.useQuery();
  const { data: boardData, isLoading: loadingBoards } = trpc.getBoards.useQuery(
    { projectId: data?.projects[0]?.id! },
    {
      enabled: !!data?.projects[0]?.id,
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
    <div className="flex flex-row flex-1">
      <DashboardNavigator project={null} />
      <div className="flex-1 relative">
        <DashboardStickyHeader board={board} />
        <div>
          {/* Grid of charts */}
          <div className="grid text-center p-8 lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
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
      </div>
    </div>
  );
};
