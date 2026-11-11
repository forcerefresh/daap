export enum PageType {
  Normal = "normal",
  Front = "front",
  Back = "back",
  Load = "load",
}

export interface IPage {
  id: string;
  customId?: string;
  name?: string;
  description?: string;
  layerIds: string[];
  nextLayerNameNumber: number;
  type?: PageType;
}

export interface IPages {
  pageById: { [id: string]: IPage };
  nextPageNameNumber: number;
  pages: string[];
  loadPages?: string[];
  frontPages?: string[];
  backPages?: string[];
}

