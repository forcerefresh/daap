import { compact, uniq } from "lodash-es";
import googleFontList from "./google-font-data.json";

export function getGoogleFontList(): string[] {
  return googleFontList.items.map((item) => item.family);
}

export function getGoogleVariants(fontFamily: string): string[] {
  return (
    googleFontList.items.find((item) => item.family === fontFamily)?.variants ??
    []
  );
}

export function getGoogleVariantsNice(fontFamily: string): string[] {
  let fff = getGoogleVariants(fontFamily).map((w) => {
    return w
      .replace("regular", "400")
      .replace("bold", "700")
      .replace("italic", "");
  });
  fff = uniq(compact(fff));
  return fff;
}
