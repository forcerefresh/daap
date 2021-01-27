import googleFontList from "./google-fonts.deff.json";

export function getGoogleFontList(): string[] {
  return googleFontList.map((item) => item.family);
}
