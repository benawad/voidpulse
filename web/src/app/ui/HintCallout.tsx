import React from "react";
import PulseMotif1 from "../landing/PulseMotif1";
import LineChartMotif from "../landing/LineChartMotif";

interface HintCalloutProps {}

export const HintCallout: React.FC<
  React.PropsWithChildren<HintCalloutProps>
> = ({ children }) => {
  return (
    <div className="bg-gradient-to-r to-cyan-500 from-indigo-500 pt-2 rounded-2xl shadow-lg font-mono inline-block m-2 overflow-hidden border-2 border-indigo-400">
      <div className="flex items-center pr-4 text-sm">
        <LineChartMotif
          style={{ width: 100, height: "auto" }}
          className="mr-4 -mb-1"
        />
        <div>
          <div className="text-primary-100 text-sm font-bold">Note</div>
          {children}
        </div>
      </div>
    </div>
  );
};
