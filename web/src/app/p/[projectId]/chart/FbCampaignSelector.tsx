import React from "react";
import { Metric } from "./metric-selector/Metric";
import { useChartStateContext } from "../../../../../providers/ChartStateProvider";
import { trpc } from "../../../utils/trpc";
import { MultiSelect } from "../../../ui/MultiSelect";

interface FbCampaignSelectorProps {
  metric: Metric | null | undefined;
  setShowCampaignSelector: (show: boolean) => void;
}

export const FbCampaignSelector: React.FC<FbCampaignSelectorProps> = ({
  metric,
  setShowCampaignSelector,
}) => {
  const [, setState] = useChartStateContext();
  const { data, isLoading } = trpc.getFbCampaigns.useQuery({});

  return isLoading ? null : (
    <MultiSelect
      selectLabel="Select campaign..."
      isLoading={isLoading}
      opts={
        data?.campaigns.map((x) => ({
          value: x.name,
          lowercaseValue: x.name.toLowerCase(),
        })) || []
      }
      startingValues={
        metric?.fbCampaignIds
          ?.map((x) => data?.campaigns.find((c) => c.id === x)?.name)
          .filter((x) => x !== undefined) || []
        //
      }
      onConfirm={(values) => {
        setState((state) => {
          return {
            ...state,
            metrics: state.metrics.map((m) =>
              m === metric
                ? {
                    ...m,
                    fbCampaignIds: values
                      .map((v) => data?.campaigns.find((c) => c.name === v)?.id)
                      .filter((v) => v !== undefined),
                  }
                : m
            ),
          };
        });
      }}
    />
  );
};
