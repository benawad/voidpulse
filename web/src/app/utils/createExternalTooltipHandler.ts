import {
  ChartTypeRegistry,
  Point,
  Chart,
  BubbleDataPoint,
  TooltipModel,
} from "chart.js";
import { TooltipData } from "../ui/charts/ChartTooltip";
import { EventEmitter } from "../ui/charts/useEventEmitter";

export type GetTooltipData = (
  datasetIndex: number,
  dataIndex: number
) => TooltipData;
export type ChartTooltipInfo = {
  waitForOnHover?: boolean;
  posUpdate?: boolean;
  left: number;
  top: number;
} & TooltipData;

export const createExternalTooltipHandler =
  (
    getTooltipData: GetTooltipData,
    $event: EventEmitter<ChartTooltipInfo | null>,
    followerCursor: boolean
  ) =>
  ({
    chart,
    tooltip,
  }: {
    chart: Chart<
      keyof ChartTypeRegistry,
      (number | Point | [number, number] | BubbleDataPoint | null)[],
      unknown
    >;
    tooltip: TooltipModel<"line" | "bar" | "doughnut">;
  }) => {
    if (!tooltip.opacity) {
      $event.emit(null);
      return;
    }

    // const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    const { left, top } = chart.canvas.getBoundingClientRect();

    $event.emit({
      ...getTooltipData(
        tooltip.dataPoints[0].datasetIndex,
        tooltip.dataPoints[0].dataIndex
      ),
      waitForOnHover: followerCursor,
      left: left + window.scrollX + tooltip.caretX,
      top: top + window.scrollY + tooltip.caretY,
    });
  };
