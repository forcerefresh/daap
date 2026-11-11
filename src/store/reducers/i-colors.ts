import { RGBColor } from "react-color";

export type ImageColors = {
  objectId: string;
  // NOTE: null means that colors are not generated. they have to be generated in the panel.
  colors: RGBColor[] | null;
};

export interface IColors {
  recentColors: RGBColor[];
  usedInDocument: RGBColor[];
  imagesColors: ImageColors[];
  documentColorPalettes: { name: string; colors: RGBColor[] }[];
  myColorPalettes: { name: string; colors: [] }[];
}
