import { ThemeId } from "@voidpulse/api";

export const colors: Record<
  ThemeId,
  {
    primary: {
      "100": string;
      "200": string;
      "300": string;
      "400": string;
      "500": string;
      "600": string;
      "700": string;
      "800": string;
      "900": string;
      "1000": string;
    };
    accent: {
      "100": string;
      "200": string;
    };
    flair: {
      "100": string;
    };
    chart: {
      "1": string;
      "2": string;
      "3": string;
      "4": string;
      "5": string;
      "6": string;
      "7": string;
    };
  }
> = {
  [ThemeId.default]: {
    primary: {
      "100": "#f1f1f7",
      "200": "#d1d0db",
      "300": "#b7b5c5",
      "400": "#9c9aae",
      "500": "#7d7b92",
      "600": "#626076",
      "700": "#403e54",
      "800": "#343344",
      "900": "#23222e",
      "1000": "#0d0d13",
    },
    accent: { "100": "#355ce9", "200": "#2c3d95" },
    flair: { "100": "#40e4d8" },
    negative: { "100": "#dc5068" },
    chart: {
      "1": "#dc5068",
      "2": "#ef8c34",
      "3": "#f2bf3c",
      "4": "#17b4a1",
      "5": "#00b2ff",
      "6": "#2b46a9",
      "7": "#8c67f6",
    },
  },
  [ThemeId.mysticalFire]: {},
  [ThemeId.infiniteVoid]: {},
  [ThemeId.deepLava]: {
    primary: {
      "100": "#f7f1f3",
      "200": "#dbd1d6",
      "300": "#c5b7bc",
      "400": "#ae9ca2",
      "500": "#927d87",
      "600": "#6e5e6a",
      "700": "#564550",
      "800": "#3e2e38",
      "900": "#281b20",
      "1000": "#16080a",
    },
    accent: { "100": "#355ce9" },
  },
  [ThemeId.electricOcean]: {},
};
