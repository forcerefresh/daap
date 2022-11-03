import {
  IInputMetadataValues,
  InputType,
  ILayoutChildrenInput,
  LayoutChildrenType,
  ILayoutChildrenValue,
  ISelectInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import {
  CommonPropertiesTuple,
  getCommonObjectPropertiesDefinition,
} from "../../webslider-sdk/src/objects/common-properties";
import {
  ILayout,
  ITransitions,
  IDefinition,
} from "../../webslider-sdk/src/objects/i-object";
import {
  FormType,
  IFormGroupItem,
} from "../../webslider-sdk/src/form/i-form-layout";
import { DeviceType } from "../../webslider-sdk/src/common/i-device-type";

export interface IResponsiveVisibility {
  showAll: boolean;
  displayOn: DeviceType[];
}

export interface ILayer extends ILayout {
  id: string;
  customId: string;
  type: "layer";
  slideId: string;
  name: string;
  isVisible: boolean;
  hasTimeline: boolean;
  objectIds: string[];
  transitions: ITransitions;
  responsiveVisibility: IResponsiveVisibility;
  definition: {
    values: ILayerValues;
    valuesMetadata: { [key: string]: IInputMetadataValues };
  };
  commonStyleDefinition?: IDefinition;
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
