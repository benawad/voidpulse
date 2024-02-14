import { useMemo, useState } from "react";
import {
  ChartTooltipInfo,
  GetTooltipData,
  createExternalTooltipHandler,
} from "../../utils/createExternalTooltipHandler";
import { ChartTooltip } from "./ChartTooltip";
import useEventEmitter from "./useEventEmitter";

export const useChartTooltip = (getTooltipData: GetTooltipData) => {
  const $event = useEventEmitter<ChartTooltipInfo | null>();

  return {
    external: useMemo(
      () => createExternalTooltipHandler(getTooltipData, $event),
      [getTooltipData]
    ),
    tooltipNode: <ChartTooltip $event={$event} />,
  };
};
