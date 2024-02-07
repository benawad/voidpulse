"use client";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import Waveform from "./Waveform";
import { StretchySvgWrapper } from "./StretchySvg";
import { LandingHero } from "./LandingHero";
import PulseMotif1 from "./PulseMotif1";

function Home() {
  return (
    <main className="overflow-y-scroll">
      <LandingHero />
      <div className="w-full h-full">
        Talk to your data!
        <PulseMotif1 />
      </div>
    </main>
  );
}

export default trpc.withTRPC(Home);
