import { Plugin } from "chart.js";
import config from "../../../../tailwind.config";
const cssVars = config.theme.extend.colors;

function extractCssVarName(cssValue: string): string {
  const regex = /var\((--[a-zA-Z0-9-]+)\)/;
  const match = cssValue.match(regex);
  return match ? match[1] : "";
}

// Function to get the hex value from a CSS variable
function getColor(cssVariable: string): string {
  // Get the computed style of the document's root element (:root)
  console.log(cssVariable);
  const style = getComputedStyle(document.documentElement);
  // Get the value of the CSS variable
  let cleanCSSVariable = extractCssVarName(cssVariable);
  let value = style.getPropertyValue(cleanCSSVariable).trim();
  // Check if the value is in raw channel values format
  const channelMatches = value.match(/\d+/g);
  if (channelMatches && channelMatches.length === 3) {
    // Convert channel values to Hex
    const [r, g, b] = channelMatches.map((num) => parseInt(num, 10));
    const toHex = (num: number) => num.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } else {
    // If the value is already in hex format or another unrecognized format, return it as is
    return value;
  }
}

// Example usage
try {
  const hexValue = getColor(cssVars.accent[100]);
  console.log(hexValue, "HERE"); // Outputs the hex value of --primary-100
} catch (error) {
  console.error(error);
}

export const colorOrder = [
  getColor(cssVars.accent[100]),
  getColor(cssVars.flair[100]),
  getColor(cssVars.chart[1]),
  getColor(cssVars.chart[2]),
  getColor(cssVars.chart[3]),
  getColor(cssVars.chart[4]),
  getColor(cssVars.chart[5]),
  getColor(cssVars.chart[6]),
  getColor(cssVars.chart[7]),
];

export const lineChartStyle = {
  // fill: true,
  tension: 0.1,
  borderColor: getColor(cssVars.accent[100]),
  pointRadius: 0,
  // pointHitRadius: 16,
  pointHoverRadius: 8,
  pointHoverBackgroundColor: getColor(cssVars.accent[100]),
  pointBorderColor: "#fff",
};

export const donutChartStyle = {
  backgroundColor: [...colorOrder],
  borderColor: ["transparent"],
  hoverOffset: 4,
};

export const barChartStyle = {
  backgroundColor: [...colorOrder],
  borderColor: ["transparent"],
  borderWidth: 2,
  borderRadius: 4,
  hoverBorderColor: [cssVars.primary[300]],
  hoverBorderRadius: 4,
};

export const stripeTooltipPlugin: Plugin<"line"> = {
  id: "stripeTooltip",
  afterTooltipDraw: function (chart, args) {
    const tooltip = chart.tooltip;
    if (!tooltip || tooltip.opacity === 0 || tooltip.dataPoints.length === 0)
      return; // Do not draw if the tooltip is not visible or if there are no data points

    const ctx = chart.ctx;
    const tooltipWidth = tooltip.width;
    const tooltipHeight = tooltip.height;
    const tooltipX = tooltip.x;
    const tooltipY = tooltip.y;

    const stripeWidth = 4; // Width of the stripe

    // Get the dataset index and borderColor for the first tooltip item
    const datasetIndex = tooltip.dataPoints[0].datasetIndex;
    const dataset = chart.data.datasets[datasetIndex];
    const stripeColor = dataset.borderColor; // Use the dataset's line color for the stripe

    // Calculate the position for the stripe (right side of the tooltip)
    const stripeX = tooltipX + tooltipWidth - stripeWidth;

    // Save the current context state
    ctx.save();

    // Draw the stripe
    ctx.fillStyle = stripeColor as any; // Set the stripe color based on the dataset's line color
    ctx.fillRect(stripeX, tooltipY, stripeWidth, tooltipHeight);

    // Restore the previous context state
    ctx.restore();
  },
};

export const verticalLinePlugin: Plugin<"line"> = {
  id: "verticalLine",
  beforeDatasetsDraw: (chart) => {
    const tooltip = chart.tooltip;
    if (tooltip && tooltip.getActiveElements().length > 0) {
      const ctx = chart.ctx;
      const x = tooltip.getActiveElements()[0].element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = cssVars.primary[800];
      ctx.stroke();
      ctx.restore();
    }
  },
};
