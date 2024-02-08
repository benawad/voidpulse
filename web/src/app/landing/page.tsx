"use client";
import { trpc } from "../utils/trpc";
import Aurora from "./Aurora";
import { LandingHero } from "./LandingHero";
import LineChartMotif from "./LineChartMotif";
import PlanetMotif1 from "./PlanetMotif1";
import PlanetMotif2 from "./PlanetMotif2";
import PulseMotif1 from "./PulseMotif1";
import { StretchySvgWrapper } from "./StretchySvg";
import WaveformBottom from "./WaveformBottom";
import "./landing.css";

function Home() {
  const sectionStyle = "flex flex-row items-center justify-center";
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
        <div className={sectionStyle}>
          <LineChartMotif style={{ width: 400, height: 400 }} />
          <div className="ml-2 text-2xl w-72">
            Analytics, without the headache 👩🏻‍💻
          </div>
        </div>

        <div className="p-12">
          <div className={`${sectionStyle}`}>
            <div className="ml-2 text-2xl">Metrics that talk back 🫢</div>
            <PulseMotif1 style={{ width: 300, height: 300, marginLeft: 36 }} />
          </div>

          <div className={`${sectionStyle} mt-36`}>
            <PlanetMotif2 style={{ width: 500, height: 500 }} />
            <div className="ml-2 text-2xl w-72">
              Insights as easy as asking a question 🤔
            </div>
          </div>
          <div className={`${sectionStyle} mt-24`}>
            <div className="ml-2 text-2xl w-60">Made by people who use it.</div>
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
