import React from "react";
import { text } from "stream/consumers";

interface PulseLoaderProps {
  isText?: boolean;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({ isText }) => {
  const pulseColor = " bg-primary-400/50";
  const plainPulse = (
    <div className={"w-full h-8 animate-pulse rounded-lg" + pulseColor}></div>
  );
  const textPulse = (
    <div className="p-4 space-y-4 animate-pulse">
      <div className={"w-full h-24 rounded" + pulseColor}></div>
      <div className="space-y-2">
        <div className={"h-4 rounded w-3/4" + pulseColor}></div>
        <div className={"h-4 rounded w-1/2" + pulseColor}></div>
        <div className={"h-4 rounded w-3/5" + pulseColor}></div>
        <div className={"h-4 rounded w-4/5" + pulseColor}></div>
      </div>
    </div>
  );
  return isText ? textPulse : plainPulse;
};
