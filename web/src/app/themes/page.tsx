"use client";
import { ThemeId } from "@voidpulse/api";
import { trpc } from "../utils/trpc";
import { colors } from "./colors";
import { useCurrTheme } from "./useCurrTheme";

const themeOpts = [
  {
    id: ThemeId.default,
    name: "Default",
  },
  {
    id: ThemeId.mysticalFire,
    name: "Mystical Fire",
  },
  {
    id: ThemeId.deepLava,
    name: "Deep Lava",
  },
  {
    id: ThemeId.infiniteVoid,
    name: "Infinite Void",
  },
  {
    id: ThemeId.electricOcean,
    name: "Electric Ocean",
  },
];

function Page() {
  const { theme, setThemeId, themeId } = useCurrTheme();

  return (
    <div className="page mono-body justify-center text-center">
      <div className="text-xl text-primary-600 p-4">Select a theme.</div>
      <div className="grid lg:grid-cols-6 p-4 space-x-4">
        {themeOpts.map((opt) => {
          const id = opt.id;
          const isSelected = opt.id === themeId;
          const primaryColors = colors[id]["primary"];
          const accentColors = colors[id]["accent"];
          const flairColors = colors[id]["flair"];
          const chartColors = colors[id]["chart"];

          return (
            <button
              key={opt.id}
              className={`relative flex flex-col justify-between items-center accent-hover overflow-hidden rounded-lg shadow-lg ${isSelected ? "ring ring-accent-100" : ""} $`}
              onClick={() => {
                setThemeId(opt.id);
              }}
              style={{
                backgroundColor: primaryColors ? primaryColors["1000"] : "",
              }}
            >
              <div
                className="mt-0 h-4 w-full"
                style={{
                  backgroundImage: accentColors
                    ? `linear-gradient(to right, ${accentColors["100"]}, ${accentColors["200"]})`
                    : "",
                }}
              />
              {/* Theme name */}
              <div
                className="py-4 text-sm"
                style={{ color: primaryColors ? primaryColors[200] : "#fff" }}
              >
                {opt.name}
              </div>
              {/* Little circles for all chart colors */}
              <div className="flex flex-row">
                <div
                  className="h-4 w-4 m-1 rounded-full"
                  style={{
                    backgroundColor: accentColors ? accentColors[100] : "",
                  }}
                />
                <div
                  className="h-4 w-4 m-1 rounded-full"
                  style={{
                    backgroundColor: flairColors ? flairColors[100] : "",
                  }}
                />
                {chartColors
                  ? Object.keys(chartColors).map((key) => {
                      return (
                        <div
                          key={key}
                          className="h-4 w-4 m-1 rounded-full"
                          style={{
                            backgroundColor:
                              chartColors[
                                key as "1" | "2" | "3" | "4" | "5" | "6" | "7"
                              ],
                          }}
                        />
                      );
                    })
                  : "???"}
              </div>

              {/* Shows the gradient of all primary colors */}
              <div className="flex flex-row w-full">
                {primaryColors
                  ? Object.keys(primaryColors).map((key) => {
                      return (
                        <div
                          key={key}
                          className="h-4 w-full"
                          style={{
                            backgroundColor:
                              primaryColors[
                                key as
                                  | "100"
                                  | "200"
                                  | "300"
                                  | "400"
                                  | "500"
                                  | "600"
                                  | "700"
                                  | "800"
                                  | "900"
                                  | "1000"
                              ],
                          }}
                        />
                      );
                    })
                  : "???"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default trpc.withTRPC(Page);
