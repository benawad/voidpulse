import { v4 } from "uuid";
import {
  DateHeader,
  LineChartGroupByTimeType,
  MetricMeasurement,
} from "../../app-router-type";
import { DbFbCampaignSpend } from "../../db";

const createSpendMap = ({
  spend,
  groupByTimeType,
  initialMap = {},
}: {
  spend: DbFbCampaignSpend[];
  groupByTimeType: LineChartGroupByTimeType;
  initialMap?: Record<string, number>;
}) => {
  // Create a spend map with the proper time increments
  const spendMap: Record<string, number> = { ...initialMap };

  // Aggregate spend by time increment
  spend.forEach((spendItem) => {
    const date = new Date(spendItem.date);
    let key: string;

    // Format the key based on groupByTimeType
    switch (groupByTimeType) {
      case LineChartGroupByTimeType.day:
        key = date.toISOString().slice(0, 10) + (initialMap ? " 00:00:00" : "");
        break;
      case LineChartGroupByTimeType.week:
        // Get the Monday of the week
        const day = date.getUTCDay();
        const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setUTCDate(diff));
        key = monday.toISOString().slice(0, 10);
        break;
      case LineChartGroupByTimeType.month:
        key = date.toISOString().slice(0, 7) + "-01"; // YYYY-MM
        break;
      default:
        key = date.toISOString().slice(0, 10); // Default to daily
    }

    spendMap[key] = (spendMap[key] || 0) + spendItem.spend;
  });

  return spendMap;
};

export const infuseDataMapWithSpend = ({
  dataMap,
  campaignSpend,
  groupByTimeType,
}: {
  dataMap: Record<string, number>;
  campaignSpend: DbFbCampaignSpend[];
  groupByTimeType: LineChartGroupByTimeType;
}) => {
  const spendMap = createSpendMap({
    spend: campaignSpend,
    groupByTimeType,
    initialMap: {},
  });

  // Create a new object instead of mutating the input
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(dataMap)) {
    const spend = spendMap[key] || 0;
    result[key] = value > 0 ? spend / value : 0;
  }
  return result;
};

export const createSpendRow = ({
  spend,
  dateMap,
  dateHeaders,
  lineChartGroupByTimeType,
  measurement,
  customLabel,
}: {
  spend: DbFbCampaignSpend[];
  dateMap: Record<string, number>;
  dateHeaders: Array<{
    label: string;
    lookupValue: string;
  }>;
  lineChartGroupByTimeType: LineChartGroupByTimeType;
  measurement: MetricMeasurement;
  customLabel?: string;
}) => {
  const formattedDateMap = createSpendMap({
    spend,
    groupByTimeType: lineChartGroupByTimeType,
    initialMap: Object.fromEntries(Object.keys(dateMap).map((key) => [key, 0])),
  });

  // Calculate average spend
  const spendValues = Object.values(formattedDateMap);
  const averageSpend = !spendValues.length
    ? 0
    : Math.round(
        (10 * spendValues.reduce((a: number, b: number) => a + b, 0)) /
          dateHeaders.length
      ) / 10;

  return {
    id: v4(),
    tableOnly: true,
    eventLabel: `Ad spend${customLabel ? ` - ${customLabel}` : ""}`,
    measurement,
    lineChartGroupByTimeType,
    average_count: averageSpend,
    data: formattedDateMap,
  };
};
