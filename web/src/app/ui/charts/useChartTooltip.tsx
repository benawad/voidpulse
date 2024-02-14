import { useCallback, useMemo, useState } from "react";
import {
  ChartTooltipInfo,
  GetTooltipData,
  createExternalTooltipHandler,
} from "../../utils/createExternalTooltipHandler";
import { ChartTooltip } from "./ChartTooltip";
import useEventEmitter from "./useEventEmitter";
import { ActiveElement, ChartEvent } from "chart.js";

export const useChartTooltip = (
  getTooltipData: GetTooltipData,
  isDonut = false
) => {
  const $event = useEventEmitter<ChartTooltipInfo | null>();

  return {
    external: useMemo(
      () => createExternalTooltipHandler(getTooltipData, $event, isDonut),
      [getTooltipData]
    ),
    onHover: useCallback((e: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length && e.x && e.y) {
        $event.emit({
          posUpdate: true,
          left: e.x,
          top: e.y + 30,
        });
        return;
      }
    }, []),
    tooltipNode: <ChartTooltip $event={$event} />,
  };
};
