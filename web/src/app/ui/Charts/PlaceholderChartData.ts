import config from "../../../../tailwind.config";
const months = ["January", "February", "March", "April", "May", "June", "July"];
const colors = config.theme.extend.colors;

export const placeholderLineData = {
  labels: months,
  datasets: [
    {
      label: "My First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};

export const placeholderDonutData = {
  labels: ["Anxious", "Anger", "Sad", "Envy"],
  datasets: [
    {
      label: "My First Dataset",
      data: [300, 50, 100, 75],
      backgroundColor: [
        colors.secondary["zen-100"],
        colors.secondary["energy-100"],
        colors.secondary["mind-100"],
        colors.secondary["body-100"],
      ],
      borderColor: ["transparent"],
      hoverOffset: 4,
    },
  ],
};

export const placeholderBarData = {
  labels: months,
  datasets: [
    {
      label: "My First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(255, 159, 64, 0.2)",
        "rgba(255, 205, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(201, 203, 207, 0.2)",
      ],
      borderColor: [
        "rgb(255, 99, 132)",
        "rgb(255, 159, 64)",
        "rgb(255, 205, 86)",
        "rgb(75, 192, 192)",
        "rgb(54, 162, 235)",
        "rgb(153, 102, 255)",
        "rgb(201, 203, 207)",
      ],
      borderWidth: 1,
    },
  ],
};
