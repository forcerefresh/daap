import { ISlideTransition } from "../../objects/types";

export interface ISlideDuration {
  inheritFrom: "inherit" | "custom";
  customValue: number;
}

export enum SlideType {
  Normal = "normal",
  Front = "front",
  Back = "back",
}

export interface ISlide {
  id: string;
  userId: string;
  name: string;
  duration: ISlideDuration;
  layerIds: string[];
  nextLayerIdCounter: number;
  slideType: SlideType;
  slideTransition: ISlideTransition;
}

export interface ISlides {
  slideById: { [id: string]: ISlide };
  allSlides: string[];
  nextSlideIdCounter: number;
  normalSlides: string[];
  frontSlides: string[];
  backSlides: string[];
}
