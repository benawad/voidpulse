import { ChartType, MsgRole, ReportType } from "../../app-router-type";
import { getEventNamesQuery } from "../../routes/charts/getEventNames";
import { llm } from "./llm";

export const doTextToChart = async (text: string, projectId: string) => {
  const eventNames = (await getEventNamesQuery(projectId)).map((x) => x.value);
  const data = await llm.chatCompletion({
    messages: [
      {
        role: MsgRole.user,
        text: `Given the input "${text}"

				And the following potential event names:

				${eventNames.join(",")}
				AnyEvent
				AllEvents

				ONLY RETURN JSON

				return only 1 json object of the following shape: { reportType: 'line'  | 'bar' | 'donut', eventNames: string[] } | { reportType: 'funnel', step1EventName: string, step2EventName: string } | { reportType: 'retention', initialEventName: string, retainingEventName: string }`,
      },
    ],
  });

  try {
    const parsed = JSON.parse(data!);
    const names: string[] = [];
    if (parsed.initialEventName) {
      names.push(parsed.initialEventName);
    }
    if (parsed.retainingEventName) {
      names.push(parsed.retainingEventName);
    }
    if (parsed.step1EventName) {
      names.push(parsed.step1EventName);
    }
    if (parsed.step2EventName) {
      names.push(parsed.step2EventName);
    }
    if (parsed.eventNames) {
      names.push(...parsed.eventNames);
    }

    return {
      chartType:
        {
          line: ChartType.line,
          bar: ChartType.bar,
          donut: ChartType.donut,
        }[parsed.reportType as "line"] || ChartType.line,
      reportType:
        {
          line: ReportType.insight,
          bar: ReportType.insight,
          donut: ReportType.insight,
          funnel: ReportType.funnel,
          retention: ReportType.retention,
        }[parsed.reportType as "line"] || ReportType.insight,
      events: names
        .map((x) => {
          if (x === "AnyEvent") {
            return {
              name: "Any event",
              value: "$*",
            };
          } else if (x === "AllEvents") {
            return {
              name: "All events",
              value: "$*",
            };
          }
          return {
            name: x,
            value: x,
          };
        })
        .filter((x) => x.value === "$*" || eventNames.includes(x.value)),
    };
  } catch {
    return null;
  }
};
