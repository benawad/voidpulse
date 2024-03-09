const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");

fs.writeFileSync(
  path.join(__dirname, "../src/version.ts"),
  'export const version = "' + packageJson.version + '";\n'
);
