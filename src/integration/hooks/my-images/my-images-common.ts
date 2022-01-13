export interface ImageData {
  url: string;
  size: { width: number; height: number; type: string };
}

export interface ImageSetDataMetadata {
  title: "";
  categories: string[];
  tags: string[];
  rating: number;
}
export interface ImageSetData extends ImageSetDataMetadata {
  images: { [key: string]: ImageData };
}
