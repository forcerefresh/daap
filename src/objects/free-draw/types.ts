export interface IFreeDrawToolConfig {
  strokeWidth: string;
  color: string;
  eraser: boolean;
}

export type IBezier = [
  [x: number, y: number],
  [x: number, y: number],
  [x: number, y: number],
  [x: number, y: number]
];

export type Points = [number, number][];
