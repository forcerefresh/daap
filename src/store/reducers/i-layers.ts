import {
  IInputMetadataValues,
  InputType,
  ILayoutChildrenInput,
  LayoutChildrenType,
  ILayoutChildrenValue,
  ISelectInput,
} from "../../inputs/types";
import {
  CommonPropertiesTuple,
  getCommonObjectPropertiesDefinition,
} from "../../objects/common-properties";
import { ILayout, ITransitions } from "../../objects/types";
import {
  FormType,
  IFormGroupItem,
} from "../../utils/form-layout/i-form-layout";
import { DeviceType } from "./i-settings";

export interface IResponsiveVisibility {
  showAll: boolean;
  displayOn: DeviceType[];
}

export interface ILayer extends ILayout {
  id: string;
  type: "layer";
  slideId: string;
  name: string;
  isVisible: boolean;
  hasTimeline: boolean;
  objectIds: string[];
  transitions: ITransitions; // effects on layer
  responsiveVisibility: IResponsiveVisibility;
  definition: {
    values: ILayerValues;
    valuesMetadata: { [key: string]: IInputMetadataValues };
  };
}

export interface ILayerValues {
  overflow: string;
  hasLayoutChildren: boolean;
  layoutChildren: ILayoutChildrenValue;
}

export interface ILayers {
  layerById: { [id: string]: ILayer };
  allLayers: string[];
}

export type LayerTuple = [
  ISelectInput<"overflow">,
  IFormGroupItem<[ILayoutChildrenInput<"layoutChildren">]>,
  ...CommonPropertiesTuple
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
      { label: "Auto", value: "auto" },
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
          itemsGap: {
            commonValue: "",
            eachValues: [],
            type: "common",
          },
        },
        defaultValue: {
          type: LayoutChildrenType.Column,
          align: "start",
          justify: "start",
          itemsGap: {
            commonValue: "",
            eachValues: [],
            type: "common",
          },
        },
      },
    ],
  },
  ...getCommonObjectPropertiesDefinition(),
];
