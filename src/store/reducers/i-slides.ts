import { ITransitions } from "webslider-sdk/lib/objects/i-object";
import { ISlideDuration } from "webslider-sdk/lib/common/i-slider-duration";

export enum SlideType {
  Normal = "normal",
  Front = "front",
  Back = "back",
}

export interface ISlide {
  id: string;
  layerIds: string[];
  nextLayerIdCounter: number;
  slideType: SlideType;
  transitionEnabled: boolean;
  transitionOverlapTime: string;
  transitionDurationTime: string;
  transitions: ITransitions;
  //props
  customId: string;
  name: string;
  duration: ISlideDuration;
  exitDuration: ISlideDuration;
}

export interface ISlides {
  slideById: { [id: string]: ISlide };
  allSlides: string[];
  nextSlideIdCounter: number;
  normalSlides: string[];
  frontSlides: string[];
  backSlides: string[];
}

/*
definition: {
    values: ISlideValues;
    valuesMetadata: { [key: string]: IInputMetadataValues };
  };
export interface ISlideValues {
  userId: string;
  name: string;
  duration: ISlideDuration;
}

export type SlideTuple = [
  ITextInput<"name">,
  ITextInput<"userId">,
  ISlideDurationInput<"duration">
];

export const layerDefinition: LayerTuple = [
  {
    displayName: "Overflow",
    propertyName: "overflow",
    inputType: InputType.SELECT,
    options: [
      { label: "Visible", value: "visible" },
      { label: "Hidden", value: "hidden" },
      { label: "Scroll", value: "scroll" },
      { label: "Auto Scroll", value: "auto" },
    ],
    value: "visible",
    defaultValue: "visible",
  },
  {
    displayName: "Layout children",
    type: FormType.GROUP,
    propertyName: "hasLayoutChildren",
    optional: true,
    elements: [
      {
        displayName: "",
        propertyName: "layoutChildren",
        inputType: InputType.LAYOUT_CHILDREN,
        value: {
          type: LayoutChildrenType.Column,
          align: "start",
          justify: "start",
        },
        defaultValue: {
          type: LayoutChildrenType.Column,
          align: "start",
          justify: "start",
        },
      },
    ],
  },
];
*/
