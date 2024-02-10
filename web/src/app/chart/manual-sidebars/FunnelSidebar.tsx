import React, { useEffect, useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { MetricBlock } from "../metric-selector/MetricBlock";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { genId } from "../../utils/genId";
import { Metric } from "../metric-selector/Metric";
import { HeaderButton } from "./HeaderButton";
import { LineSeparator } from "../../ui/LineSeparator";
import { BreakdownBlock } from "../metric-selector/BreakdownBlock";
import { FilterBlock } from "../metric-selector/FilterBlock";
import { PlusIcon } from "./PlusIcon";
import { MetricMeasurement } from "@voidpulse/api";

interface FunnelSidebarProps {}

export const FunnelSidebar: React.FC<FunnelSidebarProps> = ({}) => {
  const [{ metrics, breakdowns, globalFilters, reportType }, setState] =
    useChartStateContext();
  const [addNewMetric, setAddNewMetric] = useState(!metrics.length);
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
  const [addNewBreakdown, setAddNewBreakdown] = useState(false);
  const [addNewGlobalFilter, setAddNewGlobalFilter] = useState(false);
  const [localMetrics, setLocalMetrics] = useState<(Metric | null)[]>(() =>
    [...Array(2)].map((_, i) => metrics[i])
  );
  useEffect(() => {
    if (metrics.length >= 2) {
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
    <div>
      {/* Choosing metrics */}
      <HeaderButton
        onClick={() => {
          setAddNewMetric(true);
          setIsMetricDropdownOpen(true);
        }}
      >
        Funnel steps <PlusIcon />
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
          onDelete={() => {
            //If there are more than two metrics, let them delete:
            if (localMetrics.length > 2) {
              setMetrics(localMetrics.filter((_, i) => i !== idx));
            } else {
              //Don't let the user delete if there are only two metrics
              setMetrics(localMetrics.map((x, i) => (i !== idx ? x : null)));
            }
          }}
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
      {/* If a new metric is in the process of being added, display a new metric block UI as an input*/}
      {/* Once the metric is successfully added, hide the new block and show it as part of the list above. */}
      {addNewMetric ? (
        <MetricBlock
          showMeasurement={false}
          onEventChange={(event) => {
            setMetrics([
              ...localMetrics,
              {
                event,
                id: genId(),
                filters: [],
                type: MetricMeasurement.uniqueUsers,
              },
            ]);
            setAddNewMetric(false);
          }}
          onDelete={() => {
            setAddNewMetric(false);
          }}
          parentIsOpen={isMetricDropdownOpen}
          setParentIsOpen={setIsMetricDropdownOpen}
          idx={localMetrics.length}
        />
      ) : null}

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
    </div>
  );
};
