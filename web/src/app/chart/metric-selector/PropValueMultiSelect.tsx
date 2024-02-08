import React, { useMemo } from "react";
import { MultiSelect } from "../../ui/MultiSelect";
import { trpc } from "../../utils/trpc";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { MetricEvent } from "./MetricSelector";

interface PropValueMultiSelectProps {
  event?: MetricEvent;
  propKey: string;
  values: string[];
  onConfirm: (values: string[]) => void;
}

export const PropValueMultiSelect: React.FC<PropValueMultiSelectProps> = ({
  event,
  propKey,
  values,
  onConfirm,
}) => {
  const { projectId } = useProjectBoardContext();
  const { data, isLoading } = trpc.getPropValues.useQuery({
    event,
    propKey,
    projectId,
  });
  const opts = useMemo(() => {
    return (
      data?.values.map((x) => ({
        value: x,
        lowercaseValue: x.toLowerCase(),
      })) ?? []
    );
  }, [data]);
  return (
    <MultiSelect
      opts={opts}
      isLoading={isLoading}
      noCaret
      startingValues={values}
      onConfirm={onConfirm}
    />
  );
};
