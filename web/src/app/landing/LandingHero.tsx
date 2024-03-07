import React from "react";
import { StretchySvgWrapper } from "./StretchySvg";
import Waveform from "./Waveform";
import VoidpulseIcon from "./VoidpulseIcon";
import Link from "next/link";

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
          <div className="flex flex-row items-center">
            <VoidpulseIcon style={{ height: 50, width: 50, marginTop: 12 }} />
            <div className="text-6xl">voidpulse</div>
          </div>
          <div className="mt-2 text-2xl pl-14">copilot for product</div>
          <a href="https://forms.gle/fEWj9yCyEwnhjRdB7" className="flex">
            <div className="mt-8 bg-primary-500 text-white py-2 px-4 rounded-md">
              Join waitlist
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
