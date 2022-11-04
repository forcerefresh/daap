import React from "react";
import { IExtensionItem } from "webslider-sdk2/lib/objects/i-extensions";
import { CoreObjectType } from "webslider-sdk2/lib/objects/objects-register";
import {
  ILayout,
  ISlideTransition,
  ITransitions,
  ObjectType,
} from "webslider-sdk2/lib/objects/i-object";
import { INavigationValues } from "webslider-sdk2/lib/objects/i-navigation-types";
import { ILayers } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { Breakpoints } from "webslider-sdk2/lib/common/i-breakpoint-configuration";
import { ISlides, SlideType } from "../store/reducers/i-slides";
import {
  ISlideDuration,
  ISlideExitTime,
} from "webslider-sdk2/lib/common/i-slider-duration";

export interface ITransitionsData {
  customId: string;
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
    exitSlideDuration: ISlideDuration;
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
  name?: string;
  slideDataArr: ISlideData[];
  frontSlideDataArr: ISlideData[];
  backSlideDataArr: ISlideData[];
  skipFirstSlideAnimation: boolean;
  breakpointReference: "viewport" | "parent";
  breakpointData: {
    width: number;
    height: number;
    pageWidth: number;
    pageHeight: number;
  };
  breakpoints: Breakpoints;
  extensions: IExtensionItem[];
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
    transitionEnabled: boolean;
    transitionOverlapTime: number;
    transitionDurationTime: number;
    transitions: ITransitions;
    duration: ISlideDuration;
    exitDuration: ISlideExitTime;
  };
  transitionsData: ITransitionsData[];
}
