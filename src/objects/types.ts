import {
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "../effects/trianglify/trianglify.definition";
import {
  IInputMetadataValues,
  InputType,
  ISelectInput,
  ITextInput,
} from "../inputs/types";
import { DeviceType } from "../store/reducers/i-settings";
import { FormType } from "../utils/form-layout/form-layout";

export enum ObjectType {
  TEXT = "text",
  RICH_TEXT = "rich_text",
  //IMAGE = "image", << external
  MULTI_IMAGE = "multi_image",
  VIDEO = "video",
  //YOUTUBE_VIDEO = "youtube_video", << external
  HTML = "html",
  SVG = "svg",
  CANVAS = "canvas",
  SOURCE_IMAGE = "source_image",
  FRAME = "frame",
  BUTTON = "button",
  BULLETS = "bullets",
  ARROW = "arrow",
  //SPINNER = "spinner", << external
}

export type ItemType = "object" | "layer" | "slide";

export interface IDefinition {
  id: string;
  type: ObjectType | string;
  properties: any[];
  values: { [key: string]: any };
  valuesMetadata: { [key: string]: IInputMetadataValues };
}

export interface ICommonObjectProperties {
  left?: number;
  leftType?: "px" | "em" | "%" | "vw" | "vh";
  top?: number;
  topType?: "px" | "em" | "%" | "vw" | "vh";
  right?: number;
  rightType?: "px" | "em" | "%" | "vw" | "vh";
  bottom?: number;
  bottomType?: "px" | "em" | "%" | "vw" | "vh";
  width?: number;
  widthType?: "px" | "em" | "%" | "vw" | "vh";
  height?: number;
  heightType?: "px" | "em" | "%" | "vw" | "vh";
}

export interface IAbsoluteLayout {
  left: number;
  width: number;
  top: number;
  height: number;
}

export interface ISnapLayout {
  width: number;
  height: number;
  gap: number;
  edge: string;
  relativeTo: string;
}

export interface IFitLayout {}

export interface IGridLayout {
  deviceType: DeviceType | "common";
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface IGridLayouts {
  type: "common" | "perDevice";
  common: IGridLayout;
  perDevice: IGridLayout[];
}

export enum NavigationType {
  None = "none",
  Link = "link",
  Slide = "slide",
}

export enum NavigationEvent {
  click = "click",
  contextmenu = "contextmenu",
  dblclick = "dblclick",
  mousedown = "mousedown",
  mouseenter = "mouseenter",
  mouseleave = "mouseleave",
  mousemove = "mousemove",
  mouseout = "mouseout",
  mouseover = "mouseover",
  mouseup = "mouseup",
}

export type SlideReferenceType = "slideNo" | "slideId";

export type NavigationTuple = [
  IFormSwitchGroupItem<
    "navigationType",
    [
      IFormSwitchGroup<[]>,
      IFormSwitchGroup<
        [
          ISelectInput<"linkEvent">,
          ITextInput<"linkTarget">,
          ITextInput<"linkHref">
        ]
      >,
      IFormSwitchGroup<
        [
          ISelectInput<"slideEvent">,
          IFormSwitchGroupItem<
            "slideReferenceType",
            [
              IFormSwitchGroup<[ITextInput<"slideNo">]>,
              IFormSwitchGroup<[ITextInput<"slideId">]>,
              IFormSwitchGroup<[]>,
              IFormSwitchGroup<[]>
            ]
          >
        ]
      >
    ]
  >
];

export const navigationDefinition: NavigationTuple = [
  {
    type: FormType.SWITCH_GROUP,
    displayName: "",
    propertyName: "navigationType",
    groups: [
      {
        groupName: "None",
        groupValue: "none",
        elements: [],
      },
      {
        groupName: "Link",
        groupValue: "link",
        elements: [
          {
            displayName: "Event",
            propertyName: "linkEvent",
            inputType: InputType.SELECT,
            value: "click",
            defaultValue: "click",
            options: [
              { label: "click", value: "click" },
              { label: "contextmenu", value: "contextmenu" },
              { label: "dblclick", value: "dblclick" },
              { label: "mousedown", value: "mousedown" },
              { label: "mouseenter", value: "mouseenter" },
              { label: "mouseleave", value: "mouseleave" },
              { label: "mousemove", value: "mousemove" },
              { label: "mouseout", value: "mouseout" },
              { label: "mouseover", value: "mouseover" },
              { label: "mouseup", value: "mouseup" },
            ],
          },
          {
            displayName: "Target",
            propertyName: "linkTarget",
            inputType: InputType.TEXT,
            value: "",
            defaultValue: "",
          },
          {
            displayName: "Target",
            propertyName: "linkHref",
            inputType: InputType.TEXT,
            value: "",
            defaultValue: "",
          },
        ],
      },
      {
        groupName: "Slide",
        groupValue: "slide",
        elements: [
          {
            displayName: "Event",
            propertyName: "slideEvent",
            inputType: InputType.SELECT,
            value: "click",
            defaultValue: "click",
            options: [
              { label: "click", value: "click" },
              { label: "contextmenu", value: "contextmenu" },
              { label: "dblclick", value: "dblclick" },
              { label: "mousedown", value: "mousedown" },
              { label: "mouseenter", value: "mouseenter" },
              { label: "mouseleave", value: "mouseleave" },
              { label: "mousemove", value: "mousemove" },
              { label: "mouseout", value: "mouseout" },
              { label: "mouseover", value: "mouseover" },
              { label: "mouseup", value: "mouseup" },
            ],
          },
          {
            type: FormType.SWITCH_GROUP,
            displayName: "",
            propertyName: "slideReferenceType",
            groups: [
              {
                groupName: "No",
                groupValue: "slideNo",
                elements: [
                  {
                    displayName: "Slide No",
                    propertyName: "slideNo",
                    inputType: InputType.TEXT,
                    value: "1",
                    defaultValue: "1",
                  },
                ],
              },
              {
                groupName: "Id",
                groupValue: "slideId",
                elements: [
                  {
                    displayName: "Slide Id",
                    propertyName: "slideId",
                    inputType: InputType.TEXT,
                    value: "",
                    defaultValue: "",
                  },
                ],
              },
              {
                groupName: "Next",
                groupValue: "next",
                elements: [],
              },
              {
                groupName: "Prev",
                groupValue: "prev",
                elements: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export interface ILayout {
  supportedLayout: {
    none: boolean;
    fit: boolean;
    grid: boolean;
    absolute: boolean;
    snap: boolean;
  };
  layout:
    | "none"
    | "absolute"
    | "grid"
    | "cover"
    | "snap"
    | "fit_page"
    | "fit_stage"
    | "fit_guidelines";

  absoluteLayout?: IAbsoluteLayout;
  snapLayout?: ISnapLayout;
  gridLayouts?: IGridLayouts;
  fitLayout?: IFitLayout;
  /** object itself is setting size */
  selfSize: boolean;
}

export interface INavigationValues {
  navigationType: NavigationType;
  linkEvent: NavigationEvent;
  linkTarget: string;
  linkHref: string;
  slideEvent: NavigationEvent;
  slideReferenceType: SlideReferenceType;
  slideNo: string;
  slideId: string;
}

export interface IObject<T extends {} = {}>
  extends ICommonObjectProperties,
    ILayout {
  id: string;
  name: string;
  layerId: string;
  type: ObjectType | string;
  isVisible: boolean;
  isLocked: boolean;
  navigationDefinition: {
    values: INavigationValues;
    valuesMetadata: { [key: string]: IInputMetadataValues };
  };
  transitions: ITransitions;
  definition: IDefinition;
  commonProperties?: {
    borderRadius?: {
      common?: string;
      tl?: string;
      tr?: string;
      bl?: string;
      br?: string;
    };
  };
}
export interface IGoToSlideAction {
  action: "goToSlideAction";
  slideId?: number;
  slideLabel?: string;
}

export interface INavigateToUrlAction {
  action: "navigateToUrlAction";
  url?: number;
  target?: string;
}

export interface ITransitions {
  in?: ITransition[];
  out?: ITransition[];
  effect?: ITransition[];
  layer?: ITransition[];
  slide?: ITransition[];
}

export interface ITransition {
  delay: number;
  duration: number;
  timeDistribution?: number;
  ease?: string;
  childEase?: string;
  effect: IEffect;
  overlap?: number;
  canBeCombined: boolean;
}

export interface ISlideTransition {
  //overlap: number;
  duration: number;
  effect: IEffect;
}

export interface IEffect {
  id: string;
  values?: object;
  // properties?: object; // TODO to be defined
}
