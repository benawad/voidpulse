import { MetricMeasurement } from "@voidpulse/api";
import React, { useState } from "react";
import { useChartStateContext } from "../../../../providers/ChartStateProvider";
import { LineSeparator } from "../../ui/LineSeparator";
import { genId } from "../../utils/genId";
import { BreakdownBlock } from "../metric-selector/BreakdownBlock";
import { FilterBlock } from "../metric-selector/FilterBlock";
import { Metric } from "../metric-selector/Metric";
import { MetricBlock } from "../metric-selector/MetricBlock";
import { HeaderButton } from "./HeaderButton";
import { PlusIcon } from "./PlusIcon";

interface InsightSidebarProps {}

export const InsightSidebar: React.FC<InsightSidebarProps> = ({}) => {
  const [{ metrics, breakdowns, globalFilters, reportType }, setState] =
    useChartStateContext();
  const setMetrics = (newMetrics: Metric[]) => {
    setState((prev) => ({
      ...prev,
      metrics: newMetrics,
      visibleDataMap: null,
    }));
  };
  const [addNewMetric, setAddNewMetric] = useState(!metrics.length);
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
  const [addNewBreakdown, setAddNewBreakdown] = useState(false);
  const [addNewGlobalFilter, setAddNewGlobalFilter] = useState(false);

  return (
    <>
      {/* Choosing metrics */}
      <HeaderButton
        onClick={() => {
          setAddNewMetric(true);
          setIsMetricDropdownOpen(true);
        }}
      >
        Data <PlusIcon />
      </HeaderButton>
      {/* Display all chosen metrics  */}
      {metrics.map((m, idx) => (
        <MetricBlock
          key={m.id}
          onEventChange={(event) => {
            setMetrics(
              metrics.map((metric, i) =>
                i === idx ? { ...metric, event, filters: [] } : metric
              )
            );
          }}
          onDelete={() => {
            setMetrics(metrics.filter((_, i) => i !== idx));
          }}
          onAddFilter={(newFilter) => {
            setMetrics(
              metrics.map((metric, i) =>
                i === idx
                  ? {
                      ...metric,
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
          onEventChange={(event) => {
            setMetrics([
              ...metrics,
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
          idx={metrics.length}
        />
      ) : null}

      {/* Choosing date range */}
      {/* Choosing filters */}
      <HeaderButton onClick={() => setAddNewGlobalFilter(true)}>
        Filter <PlusIcon />
      </HeaderButton>
      <div>
        {globalFilters.map((globalFilter, i) => {
          return (
            <div key={globalFilter.id} className="standard card p-2">
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
            </div>
          );
        })}
        {addNewGlobalFilter ? (
          <div className="standard card p-2">
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
          </div>
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
