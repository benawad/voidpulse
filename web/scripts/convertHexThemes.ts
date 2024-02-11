import * as fs from "fs";
import * as path from "path";

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

// Replace 'hexThemes.css' with the path to your input CSS file
const inputFilePath = path.join(__dirname, "../src/app/hexThemes.css");
// The output file will be 'themes.css'
const outputFilePath = path.join(__dirname, "../src/app/themes.css");

convertCssFile(inputFilePath, outputFilePath);
