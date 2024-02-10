import React, { useEffect, useState } from "react";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { LineSeparator } from "../../ui/LineSeparator";
import { genId } from "../../utils/genId";
import { BreakdownBlock } from "../metric-selector/BreakdownBlock";
import { FilterBlock } from "../metric-selector/FilterBlock";
import { Metric } from "../metric-selector/Metric";
import { MetricBlock } from "../metric-selector/MetricBlock";
import { HeaderButton } from "./HeaderButton";
import { PlusIcon } from "./PlusIcon";
import { SidebarHeader } from "./SidebarHeader";
import { FloatingTrigger } from "../../ui/FloatingTrigger";
import { FloatingTooltip } from "../../ui/FloatingTooltip";

interface InsightSidebarProps {}

export const RetentionSidebar: React.FC<InsightSidebarProps> = ({}) => {
  const [{ metrics, breakdowns, globalFilters, reportType }, setState] =
    useChartStateContext();

  const [addNewBreakdown, setAddNewBreakdown] = useState(false);
  const [addNewGlobalFilter, setAddNewGlobalFilter] = useState(false);
  const [localMetrics, setLocalMetrics] = useState<(Metric | null)[]>(() =>
    [...Array(2)].map((_, i) => metrics[i])
  );
  useEffect(() => {
    if (metrics.length === 2) {
      setLocalMetrics(metrics);
    }
  }, [metrics]);
  const setMetrics = (newMetrics: (Metric | null)[]) => {
    if (newMetrics.every((x) => x?.event)) {
      setState((prev) => ({
        ...prev,
        metrics: newMetrics as Metric[],
        visibleDataMap: null,
      }));
    }
    setLocalMetrics(newMetrics);
  };

  return (
    <>
      {/* Choosing metrics */}
      <HeaderButton disableHover>
        {/* Uniquely has no plus button, so needs extra styling to match size */}
        <div className="py-1">Initial & returning criteria</div>
      </HeaderButton>
      {/* Display all chosen metrics  */}
      {localMetrics.map((m, idx) => (
        <MetricBlock
          showMeasurement={false}
          defaultOpen={false}
          key={idx}
          onEventChange={(event) => {
            setMetrics(
              localMetrics.map((metric, i) =>
                i === idx
                  ? { ...metric, id: metric?.id || genId(), event, filters: [] }
                  : metric
              )
            );
          }}
          onDelete={
            m
              ? () => {
                  setLocalMetrics(
                    localMetrics.map((x, i) => (i !== idx ? x : null))
                  );
                }
              : undefined
          }
          onAddFilter={(newFilter) => {
            setMetrics(
              localMetrics.map((metric, i) =>
                i === idx
                  ? {
                      ...metric!,
                      filters: [...(metric?.filters || []), newFilter],
                    }
                  : metric
              )
            );
          }}
          idx={idx}
          metric={m}
        />
      ))}

      {/* Choosing date range */}
      {/* Choosing filters */}
      <HeaderButton onClick={() => setAddNewGlobalFilter(true)}>
        Filter <PlusIcon />
      </HeaderButton>
      <div>
        {globalFilters.map((globalFilter, i) => {
          return (
            <React.Fragment key={globalFilter.id}>
              <FilterBlock
                key={i}
                onDelete={() => {
                  setState((prev) => ({
                    ...prev,
                    globalFilters: prev.globalFilters.filter(
                      (f, j) => f.id !== globalFilter.id
                    ),
                  }));
                }}
                filter={globalFilter}
                onFilterDefined={(filter) => {
                  setState((prev) => ({
                    ...prev,
                    globalFilters: prev.globalFilters.map((x, j) =>
                      x.id === globalFilter.id ? filter : x
                    ),
                  }));
                }}
              />
            </React.Fragment>
          );
        })}
        {addNewGlobalFilter ? (
          <>
            <FilterBlock
              filter={{}}
              onFilterDefined={(filter) => {
                //Tell the parent to add a new filter to the metric
                setState((prev) => ({
                  ...prev,
                  globalFilters: [...prev.globalFilters, filter],
                }));
                //Hide the new filter shell
                setAddNewGlobalFilter(false);
              }}
              onDelete={() => {
                setAddNewGlobalFilter(false);
              }}
              onEmptyFilterAbandoned={() => {
                setAddNewGlobalFilter(false);
              }}
            />
          </>
        ) : null}
      </div>

      {/* Choosing breakdown */}
      <HeaderButton onClick={() => setAddNewBreakdown(true)}>
        Breakdown <PlusIcon />
      </HeaderButton>
      {addNewBreakdown || breakdowns.length ? (
        <BreakdownBlock
          breakdown={breakdowns[0]}
          onBreakdown={(propKey) => {
            setState((prev) => ({
              ...prev,
              breakdowns: [propKey],
              visibleDataMap: null,
            }));
          }}
          onDelete={() => {
            setState((prev) => ({
              ...prev,
              breakdowns: [],
              visibleDataMap: null,
            }));
            setAddNewBreakdown(false);
          }}
          onEmptyBreakdownAbandoned={() => {
            setAddNewBreakdown(false);
          }}
        />
      ) : null}
    </>
  );
};
