import * as fs from "fs";
import prettier from "prettier";
import * as path from "path";
import css from "css";

function hexToRgb(hex: string): string {
  // Extract the hex digits
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  return `${r} ${g} ${b}`;
}

function convertCssFile(inputFilePath: string, outputFilePath: string): void {
  const fileContent = fs.readFileSync(inputFilePath, "utf8");

  // Regular expression to match hex color codes
  const hexColorRegex = /#([0-9a-f]{6})/gi;

  const convertedContent = fileContent.replace(hexColorRegex, (match) => {
    return `${hexToRgb(match)}`;
  });

  fs.writeFileSync(outputFilePath, convertedContent);
}
type CSSRule = {
  type: string;
  selectors?: string[];
  declarations?: { type: string; property?: string; value?: string }[];
};

type StyleSheet = {
  type: string;
  stylesheet: { rules: CSSRule[] };
};

type ColorValue = string;

type ColorGroup = {
  [index: string]: ColorValue | ColorGroup;
};

type Theme = {
  [group: string]: ColorGroup;
};

type Themes = {
  default: Theme;
  [themeName: string]: Theme;
};

// Convert CSS variable names to camelCase for TypeScript compatibility
const toCamelCase = (str: string): string =>
  str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

// Function to parse the JSON object and extract color themes
const parseJsonToThemes = (json: StyleSheet): Themes => {
  const themes: Themes = { default: {} };

  json.stylesheet.rules.forEach((rule) => {
    const themeName =
      rule.selectors?.[0] === ":root"
        ? "default"
        : rule.selectors?.[0].replace(".", "") || "default";
    themes[themeName] = themes[themeName] || {};

    rule.declarations?.forEach((declaration) => {
      if (
        declaration.type === "declaration" &&
        declaration.property &&
        declaration.value
      ) {
        const [group, index] = declaration.property
          .replace("--", "")
          .split("-")
          .map((part, i) => (i === 0 ? part.toLowerCase() : toCamelCase(part)));
        themes[themeName][group] = themes[themeName][group] || {};
        (themes[themeName][group] as ColorGroup)[index] = declaration.value;
      }
    });
  });

  return themes;
};

// Function to read CSS file and convert to TypeScript object
const convertCssToTsObject = (filePath: string) => {
  const cssContent = fs.readFileSync(filePath, "utf-8");
  const thing = parseJsonToThemes(
    css.parse(cssContent, {
      silent: true,
    }) as any
  );
  Object.keys(thing).forEach((key) => {
    if (key.includes("@tailwind")) {
      delete thing[key];
    }
  });

  return prettier.format(
    `
  import { ThemeId } from "@voidpulse/api";

  export const colors: Record<ThemeId,  {
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
    negative: {
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
  }> = {
    ${Object.entries(thing).map(([themeName, theme]) => {
      return `[ThemeId.${themeName}]: ${JSON.stringify(theme)}`;
    })}
  }`,
    {
      parser: "typescript",
    }
  );
};

// Replace 'hexThemes.css' with the path to your input CSS file
const inputFilePath = path.join(__dirname, "../src/app/css/hexThemes.css");
// The output file will be 'themes.css'
const outputFilePath = path.join(__dirname, "../src/app/css/themes.css");

convertCssFile(inputFilePath, outputFilePath);

convertCssToTsObject(inputFilePath).then((str) => {
  fs.writeFileSync(path.join(__dirname, "../src/app/themes/colors.ts"), str);
});
