import React from "react";
import { MetricFilter } from "./Metric";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { trpc } from "../../utils/trpc";

interface FilterSelectorProps {
  eventName: string;
  filter: MetricFilter;
  onFilterChosen: (filter: MetricFilter) => void;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  filter,
  onFilterChosen,
}) => {
  const { projectId } = useProjectBoardContext();
  //   const { data } = trpc.getPropKeys.useQuery({ eventName });
  return <div></div>;
};
