// import { ITransitions } from "webslider-sdk/lib/objects/i-object";
// import { ISlideDuration } from "webslider-sdk/lib/common/i-slider-duration";

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
  // transitionEnabled: boolean;
  // transitionOverlapTime: string;
  // transitionDurationTime: string;
  // transitions: ITransitions;
  //props

  // title?: string;

  // duration: ISlideDuration;
  // exitDuration: ISlideDuration;
  // moveToTop: boolean;
}

export interface IPages {
  pageById: { [id: string]: IPage };
  // allPages: string[];
  nextPageNameNumber: number;
  pages: string[];
  loadPages?: string[];
  frontPages?: string[];
  backPages?: string[];
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
