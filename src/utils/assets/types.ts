export interface ImageItem {
  url: string;
  size: { width: number; height: number; type: string };
}

export interface ImageDataInfo {
  title: string;
  categories?: string[];
  tags?: string[];
  rating?: number;
}

export interface ImageData extends ImageDataInfo {
  images: {
    thumbnail?: ImageItem;
    small?: ImageItem;
    medium?: ImageItem;
    large?: ImageItem;
    xlarge?: ImageItem;
    xxlarge?: ImageItem;
    xxxlarge?: ImageItem;
    original?: ImageItem;
  };
}
