import { IFormGroupItem } from "../../effects/trianglify/trianglify.definition";
import {
  IInputMetadataValues,
  InputType,
  ISizeInput,
  ILayoutChildrenInput,
  LayoutChildrenType,
  ILayoutChildrenValue,
} from "../../inputs/types";
import { IDefinition, ILayout, ITransitions } from "../../objects/types";
import { FormType } from "../../utils/form-layout/form-layout";
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
  hasLayoutChildren: boolean;
  layoutChildren: ILayoutChildrenValue;
}

export interface ILayers {
  layerById: { [id: string]: ILayer };
  allLayers: string[];
}

export type LayerTuple = [
  IFormGroupItem<[ILayoutChildrenInput<"layoutChildren">]>
];

export const layerDefinition: LayerTuple = [
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
