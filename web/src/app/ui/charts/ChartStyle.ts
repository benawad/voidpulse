import { Plugin } from "chart.js";

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
