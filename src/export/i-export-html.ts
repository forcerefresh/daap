import {
  INavigationValues,
  ISlideTransition,
  ITransitions,
} from "../objects/types";
import { ILayers } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { ISlideDuration, ISlides, SlideType } from "../store/reducers/i-slides";

export interface ITransitionsData {
  objectClass: string;
  transitions: ITransitions;
  events?: INavigationValues;
  data: {
    slideDuration: ISlideDuration;
    objectWidth?: number;
    objectHeight?: number;
    objectLeft?: number;
    objectTop?: number;
    objectHtml?: string;
    overflow: string;
  };
}

export interface ISlideTransitionData {
  transitions: ITransitions;
}

export interface IPlayerData {
  html: string;
  slideDataArr: ISlideData[];
  breakpointData: {
    width: number;
    height: number;
    pageWidth: number;
  };
}

export interface ISources {
  slides: ISlides;
  layers: ILayers;
  objects: IObjects;
}

export interface ISlideData {
  slide: {
    id: string;
    userId: string;
    slideType: SlideType;
    transitions: ITransitions;
    duration: ISlideDuration;
  };
  transitionsData: ITransitionsData[];
}
