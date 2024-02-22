import { useCallback, useMemo, useState } from "react";
import {
  ChartTooltipInfo,
  GetTooltipData,
  createExternalTooltipHandler,
} from "../../utils/createExternalTooltipHandler";
import { ChartTooltip } from "./ChartTooltip";
import useEventEmitter from "./useEventEmitter";
import { ActiveElement, Chart, ChartEvent } from "chart.js";

export const useChartTooltip = (
  getTooltipData: GetTooltipData,
  followCursor = false
) => {
  const $event = useEventEmitter<ChartTooltipInfo | null>();

  return {
    external: useMemo(
      () => createExternalTooltipHandler(getTooltipData, $event, followCursor),
      [getTooltipData]
    ),
    onHover: useCallback(
      (e: ChartEvent, elements: ActiveElement[], chart: Chart) => {
        if (elements.length && e.x && e.y) {
          const { top, left } = chart.canvas.getBoundingClientRect();
          $event.emit({
            posUpdate: true,
            left: left + e.x + window.scrollX,
            top: top + e.y + window.scrollY,
          });
          return;
        }
      },
      []
    ),
    tooltipNode: <ChartTooltip $event={$event} />,
  };
};
