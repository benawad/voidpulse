"use client";
import { trpc } from "../utils/trpc";
import { LandingHero } from "./LandingHero";
import PulseMotif1 from "./PulseMotif1";
import "./landing.css";

function Home() {
  return (
    <main className="landing-body overflow-y-scroll">
      <LandingHero />
      <div className="w-full h-full flex flex-row items-center">
        <PulseMotif1 />

        <div className="ml-2 text-2xl">Graphs that talk back.</div>
      </div>
    </main>
  );
}

export default trpc.withTRPC(Home);
