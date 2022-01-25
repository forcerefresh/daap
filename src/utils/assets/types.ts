export type MediaType = "image" | "video" | "vector";

export interface ImageItem {
  url: string;
  size: { width: number; height: number; type: string };
}

export interface MediaDataInfo {
  id?: string;
  title: string;
  categories?: string[];
  tags?: string[];
  rating?: number;
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

export interface VideoItem {
  url: string;
  size: { width: number; height: number; type: string };
}
export interface VideoThumbnailItem {
  url: string;
  size: { width: number; height: number; type: string };
}

export interface VideoData extends MediaDataInfo {
  videos: {
    original: VideoItem;
  };
  thumbnails: {
    thumbnail?: VideoThumbnailItem;
    small?: VideoThumbnailItem;
    medium?: VideoThumbnailItem;
    large?: ImageItem;
  };
}
