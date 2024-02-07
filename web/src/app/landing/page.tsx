"use client";
import { trpc } from "../utils/trpc";
import Aurora from "./Aurora";
import { LandingHero } from "./LandingHero";
import PlanetMotif1 from "./PlanetMotif1";
import PulseMotif1 from "./PulseMotif1";
import { StretchySvgWrapper } from "./StretchySvg";
import WaveformBottom from "./WaveformBottom";
import "./landing.css";

function Home() {
  return (
    <main className="landing-body overscroll-none">
      <LandingHero />
      {/* Next section */}
      <div
        className="w-full h-full relative pt-36 bg-primary-900"
        style={{
          background:
            "radial-gradient(73.05% 62.39% at 61.96% 61.46%, #0029D5 0%, #08091E 84.5%)",
        }}
      >
        {/* Bottom waveform graphic */}
        <StretchySvgWrapper viewBox="0 0 830 117" className="-top-1 absolute">
          <WaveformBottom style={{ width: "100vw", height: "auto" }} />
        </StretchySvgWrapper>
        {/* Information and content */}
        <div className="p-12">
          <div className="flex flex-row items-center justify-center">
            <PulseMotif1 style={{ width: 300, height: 300 }} />
            <div className="ml-2 text-2xl">Graphs that talk back 😎</div>
          </div>
          <div className="flex flex-row items-center justify-center">
            <div className="ml-2 text-2xl">
              Analytics, without the headache 👩🏻‍💻
            </div>
            <PlanetMotif1 style={{ width: 400, height: 400 }} />
          </div>
          <div className="flex flex-row items-center justify-center">
            <PulseMotif1 style={{ width: 300, height: 300 }} />
            <div className="ml-2 text-2xl">
              Insights as easy as asking a question 🤔
            </div>
          </div>
          <div className="flex flex-row items-center justify-center">
            <div className="ml-2 text-2xl">Made by founders who use it.</div>
            <PlanetMotif1 style={{ width: 400, height: 400 }} />
          </div>
        </div>
        <StretchySvgWrapper viewBox="0 0 688 296" className="">
          <Aurora />
        </StretchySvgWrapper>
      </div>
    </main>
  );
}

export default trpc.withTRPC(Home);
