export interface Ratio {
  vertical: number;
  horizontal: number;
}

export interface Dimensions {
  width: number;
  height: number;
  ratio?: Ratio;
}

export interface DimensionSet {
  mm?: Dimensions;
  inch?: Dimensions;
  px?: Dimensions;
}

export interface ValueSet {
  mm?: number;
  inch?: number;
  px?: number;
}
export interface Margin {
  common?: ValueSet;
  left?: ValueSet;
  top?: ValueSet;
  bottom?: ValueSet;
  right?: ValueSet;
}

export interface DocumentItem {
  name: string;
  dimensions: DimensionSet;
  margin: Margin;
}

export interface Category {
  category: string;
  items: (DocumentItem | Category)[];
}

export interface MediaFormatData {
  category: string;
  items: Category[];
}

export type MediaFormats = MediaFormatData[];
