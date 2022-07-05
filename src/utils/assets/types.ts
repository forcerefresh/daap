export type MediaType = "image" | "video" | "vector" | "extension";

export interface MediaItem {
  id?: string;
  url?: string;
  filename?: string;
  mediaType?: MediaType;
  sourceType?: "local" | string;
  sizeType?:
    | "original"
    | "thumbnail"
    | "small"
    | "medium"
    | "large"
    | "xlarge"
    | "xxlarge"
    | "xxxlarge"
    | string;
  size?: { width: number; height: number; type: string };
  src?: string;
}
export interface ImageItem extends MediaItem {}

export interface MediaDataInfo {
  id?: string;
  title: string;
  categories?: string[];
  tags?: string[];
  rating?: number;
  filename?: string;
}

export interface ImageData extends MediaDataInfo {
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

export interface VectorData extends MediaDataInfo {
  svgString: string;
}

export interface VectorData extends MediaDataInfo {
  svgString: string;
}

export interface VideoItem extends MediaItem {}

export interface VideoThumbnailItem {
  id?: string;
  url?: string;
  filename?: string;
  mediaType?: MediaType;
  sourceType?: "local" | string;
  sizeType?:
    | "original"
    | "thumbnail"
    | "small"
    | "medium"
    | "large"
    | "xlarge"
    | "xxlarge"
    | "xxxlarge"
    | string;
  size: { width: number; height: number; type: string };
  src?: string;
}

export interface VideoData extends MediaDataInfo {
  videos: {
    original: VideoItem;
  };
  images: {
    thumbnail?: VideoThumbnailItem;
    small?: VideoThumbnailItem;
    medium?: VideoThumbnailItem;
    original?: VideoThumbnailItem;
    large?: ImageItem;
  };
}

export interface ExtesnsionData extends MediaDataInfo {
  //TODO
  file: string;
}
