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

export const ThemePicker = () => {
  const { theme, setThemeId, themeId } = useCurrTheme();

  return (
    <>
      <div className="grid lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2">
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
              className={`relative flex flex-col justify-between items-center accent-hover overflow-hidden rounded-lg transform transition ease-in duration-200 shadow-lg m-2 ${isSelected ? "ring ring-accent-100" : ""} $`}
              onClick={() => {
                setThemeId(opt.id);
              }}
              style={{
                backgroundColor: primaryColors ? primaryColors["1000"] : "",
                filter: "brightness(90%)",
                transition: "filter 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(130%)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(90%)")
              }
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
                className="py-4 text-sm mono-body"
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
    </>
  );
};
