export type KeyValuePair = { [key: string]: any };

export interface startProps extends KeyValuePair {
  itemId: string; // objectId or layerId or slideId
  currTime: number;
  config: { delay: number; duration: number };
}

export interface stopProps extends KeyValuePair {
  itemId: string; // objectId or layerId or slideId
  currTime: number;
  config: { delay: number; duration: number };
}

export interface updateProps extends KeyValuePair {
  itemId: string; // objectId or layerId or slideId
  currTime: number;
  config: { delay: number; duration: number };
}
