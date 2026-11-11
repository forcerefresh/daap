import { getGoogleFontList } from "./google-fonts";

export function getFonts() {
  const systemFonts = getSystemFonts().map((name) => ({
    fontFamily: name,
    source: "system-fonts",
  }));

  const googleFonts = getGoogleFontList().map((name) => ({
    fontFamily: name,
    source: "google-fonts",
  }));

  return [...systemFonts, ...googleFonts];
}

function getSystemFonts() {
  return [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Courier",
    "Verdana",
    "Georgia",
    "Tahoma",
  ].sort();
}
