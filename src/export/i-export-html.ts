import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { CoreObjectType, ICalculatedObjectSize } from "webslider-sdk/lib/objects/objects-register";
import {
  ILayout,
  ITransitions,
} from "webslider-sdk/lib/objects/i-object";
import { INavigationValues } from "webslider-sdk/lib/objects/i-navigation-types";
import { ILayers } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IPages, PageType } from "../store/reducers/i-pages";
import {
  ISlideDuration,
  ISlideExitTime,
} from "webslider-sdk/lib/common/i-slider-duration";
import { RGBColor } from "react-color";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";

export interface IItemsData {
  itemId: string;
  parentItemId?: string;
  itemType: "layer" | "stage" | string;
  itemVersion?: string;
  properties: Record<string, any>;
  style: Record<string, any>;
  transform: Record<string, any>;

  itemSystemType?: CoreObjectType;
  calculatedObjectSize?: ICalculatedObjectSize;
  calculatedObjectSizePerDevice?: { [key: string]: ICalculatedObjectSize };
  objectClass: string;
  events?: INavigationValues;
  data: {
    objectWidth?: number;
    objectHeight?: number;
    objectLeft?: number;
    objectTop?: number;
    objectHtml?: string;
    overflow: string;
  };
  layout: Pick<ILayout, "selfSize">;
}

export interface ISlideTransitionData {
  transitions: ITransitions;
}

export interface IPlayerData {
  html: string;
  name?: string;
  slides: ISlideData[];
  loadSlides: ISlideData[];
  frontSlides: ISlideData[];
  backSlides: ISlideData[];
  itemsVisibility: ItemVisibility[];
  config: {
    pageBackgroundColor: RGBColor;
    skipFirstSlideAnimation: boolean;
    breakpointReference: "viewport" | "parent";
    autoPlay?: boolean;
    hideOutsideContent?: boolean;
  };
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
  slides: IPages;
  layers: ILayers;
  objects: IObjects;
}

export interface ISlideData {
  slide: {
    id: string;
    customId: string;
    slideType: PageType;
    transitionEnabled: boolean;
    transitionOverlapTime: number;
    transitionDurationTime: number;
    transitions: ITransitions;
    duration: ISlideDuration;
    exitDuration: ISlideExitTime;
    moveToTop: boolean;
    title?: string;
    description?: string;
  };
  items: IItemsData[];
}

export interface ItemVisibility {
  id: string;
  displayOn: DeviceType[];
  itemType: "layer" | "object";
}
