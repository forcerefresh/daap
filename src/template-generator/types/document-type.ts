export interface MarginCommon {
  px: number;
}

export interface Margin {
  common: MarginCommon;
}

export interface DocumentType {
  id: string;
  name: string;
  parentId: string;
  level: number;
  widthMm: number | null;
  heightMm: number | null;
  widthInch: number | null;
  heightInch: number | null;
  widthPx: number;
  heightPx: number;
  margin: Margin;
}
