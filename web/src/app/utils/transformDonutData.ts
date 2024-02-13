import { RouterOutput } from "./trpc";

export const transformDonutData = ({
  datas,
  visibleDataMap,
  highlightedId,
  donutChartStyle,
}: {
  datas: Extract<RouterOutput["getReport"]["datas"], { value: number }[]>;
  visibleDataMap?: Record<string, boolean> | null;
  highlightedId?: string | null;
  donutChartStyle: any;
}) => {
  return {
    labels: datas.map((x) => "" + (x.breakdown ?? x.eventLabel)),
    datasets: [
      {
        ...donutChartStyle,
        label: datas[0].eventLabel,
        data: datas.map((x) => x.value),
      },
    ],
  };
};
