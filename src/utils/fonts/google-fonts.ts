import { compact, uniq } from "lodash-es";
import googleFontList from "./google-fonts.deff.json";

export function getGoogleFontList(): string[] {
  return googleFontList.map((item) => item.family);
}

export function getGoogleVariants(fontFamily: string): string[] {
  return (
    googleFontList.find((item) => item.family === fontFamily)?.variants ?? []
  );
}

export function getGoogleVariantsNice(fontFamily: string): string[] {
  let fff = getGoogleVariants(fontFamily).map((w) => {
    return w
      .replace("regular", "400")
      .replace("bold", "700")
      .replace("italic", "");
  });
  //fff.push("700");
  fff = uniq(compact(fff));
  return fff;
}
