interface Ratio {
  vertical: number;
  horizontal: number;
}

interface Dimensions {
  width: number;
  height: number;
  ratio?: Ratio;
}

interface DimensionSet {
  mm?: Dimensions;
  inch?: Dimensions;
  px?: Dimensions;
}

interface ValueSet {
  mm?: number;
  inch?: number;
  px?: number;
}
interface Margin {
  common?: ValueSet;
  left?: ValueSet;
  top?: ValueSet;
  bottom?: ValueSet;
  right?: ValueSet;
}

interface DocumentItem {
  name: string;
  dimensions: DimensionSet;
  margin: Margin;
}

interface Category {
  category: string;
  items: (DocumentItem | Category)[];
}

interface MediaFormatData {
  category: string;
  items: Category[];
}

type MediaFormats = MediaFormatData[];
