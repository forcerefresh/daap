import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";

export interface IFreeDrawToolConfig {
  strokeWidth: string;
  color: RGBColor;
  eraser: boolean;
}

export type IBezier = [
  [x: number, y: number],
  [x: number, y: number],
  [x: number, y: number],
  [x: number, y: number]
];

export type Points = [number, number][];
