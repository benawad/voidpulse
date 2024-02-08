import React from "react";
import { StretchySvgWrapper } from "./StretchySvg";
import Waveform from "./Waveform";

interface LandingHeroProps {}

export const LandingHero: React.FC<LandingHeroProps> = ({}) => {
  return (
    <div
      className="relative page flex flex-col h-full w-full justify-center"
      style={{
        background:
          "radial-gradient(73.05% 62.39% at 61.96% 61.46%, #0029D5 0%, #0B1891 45.5%, #08091E 84.5%)",
      }}
    >
      <StretchySvgWrapper
        viewBox="0 0 830 414"
        preserveAspectRatio={"xMidYMid meet"}
        className="bottom-0 absolute"
      >
        <Waveform style={{ width: "100vw", height: "auto" }} />
      </StretchySvgWrapper>

      <div className="lg:w-1/2 sm:w-full justify-center -mt-12 ml-24 z-10">
        <div className="text-left flex flex-col">
          <div className="text-6xl">voidpulse</div>
          <div className="mt-2 text-2xl">copilot for product</div>
        </div>
      </div>
    </div>
  );
};
