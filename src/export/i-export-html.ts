import React from "react";
import { CoreObjectType } from "../objects/objects-factory";
import {
  ILayout,
  INavigationValues,
  ISlideTransition,
  ITransitions,
  ObjectType,
} from "../objects/types";
import { ILayers } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { Breakpoints } from "../store/reducers/i-settings";
import { ISlideDuration, ISlides, SlideType } from "../store/reducers/i-slides";

export interface ITransitionsData {
  itemId: string;
  itemType: "layer" | "stage" | ObjectType | string; // stage, layer, or object type text, image, video...
  itemValues: { [key: string]: any };
  itemSystemType?: CoreObjectType;
  calculatedObjectSize?: React.CSSProperties;
  calculatedObjectSizePerDevice?: { [key: string]: React.CSSProperties };
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
  layout: Pick<ILayout, "layout" | "selfSize"> &
    Partial<
      Pick<
        ILayout,
        "absoluteLayout" | "fitLayout" | "gridLayouts" | "snapLayout"
      >
    >;
}

export interface ISlideTransitionData {
  transitions: ITransitions;
}

export interface IPlayerData {
  html: string;
  slideDataArr: ISlideData[];
  frontSlideDataArr: ISlideData[];
  breakpointData: {
    width: number;
    height: number;
    pageWidth: number;
    pageHeight: number;
  };
  breakpoints: Breakpoints;
}

export interface ISources {
  slides: ISlides;
  layers: ILayers;
  objects: IObjects;
}

export interface ISlideData {
  slide: {
    id: string;
    customId: string;
    slideType: SlideType;
    transitions: ITransitions;
    duration: ISlideDuration;
  };
  transitionsData: ITransitionsData[];
}
