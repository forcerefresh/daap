import { ITransitions } from "../../objects/types";
import { DeviceType } from "./i-settings";

export interface IResponsiveVisibility {
  showAll: boolean;
  displayOn: DeviceType[];
}

export interface ILayer {
  id: string;
  slideId: string;
  name: string;
  isVisible: boolean;
  hasTimeline: boolean;
  objectIds: string[];
  transitions: ITransitions; // effects on layer
  responsiveVisibility: IResponsiveVisibility;
}

export interface ILayers {
  layerById: { [id: string]: ILayer };
  allLayers: string[];
}
