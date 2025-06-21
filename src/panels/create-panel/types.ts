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

interface DocumentItem {
  name: string;
  dimensions: DimensionSet;
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
