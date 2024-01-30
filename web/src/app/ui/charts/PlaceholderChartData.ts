import { barChartStyle, donutChartStyle, lineChartStyle } from "./ChartStyle";

//All of this info can be replaced.
//Ref for how each chart data object is supposed to look.

export const placeholderCharts = [
  {
    title: "Starter picks",
    subtitle: "Which Voidpet did players choose?",
    chartType: "donut",
  },
  { title: "Downloads", subtitle: "Downloads by month", chartType: "bar" },
  { title: "MAU & DAU", subtitle: "Active users", chartType: "line" },
];

const months = ["Jan 1", "Feb 1", "Mar 1", "Apr 1", "May 1", "Jun 1", "Jul 1"];

export const placeholderLineData = {
  labels: months,
  datasets: [
    {
      ...lineChartStyle,
      label: "My First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
    },
  ],
};

export const placeholderDonutData = {
  labels: ["Anxious", "Anger", "Sad", "Envy"],
  datasets: [
    {
      ...donutChartStyle,
      label: "My First Dataset",
      data: [300, 50, 100, 75],
    },
  ],
};

export const placeholderBarData = {
  labels: months,
  datasets: [
    {
      ...barChartStyle,
      label: "My First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
    },
  ],
};
