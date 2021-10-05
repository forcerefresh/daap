import { ITransitions } from "../../objects/types";

export interface ILayer {
  id: string;
  slideId: string;
  name: string;
  isVisible: boolean;
  hasTimeline: boolean;
  objectIds: string[];
  transitions: ITransitions;
}

export interface ILayers {
  layerById: { [id: string]: ILayer };
  allLayers: string[];
}
