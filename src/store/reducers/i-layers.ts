import {
  InputType,
  ILayoutChildrenInput,
  LayoutChildrenType,
  ILayoutChildrenValue,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  ILayout,
} from "webslider-sdk/lib/objects/i-object";
import { FormType, IFormGroupItem } from "webslider-sdk/lib/form/i-form-layout";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";

export interface IResponsiveVisibility {
  showAll: boolean;
  displayOn: DeviceType[];
}

export interface ILayer extends ILayout {
  id: string;
  customId?: string;
  type: "layer";
  pageId: string;
  name?: string;
  // title?: string;
  description?: string;
  isHidden?: boolean;
  // hasTimeline: boolean;
  objectIds: string[];
  // transitions: ITransitions;
  // responsiveVisibility: IResponsiveVisibility;
  properties?: Record<string, any>;
  // definition: {
  //   values: ILayerValues;
  //   valuesMetadata: { [key: string]: IInputMetadataValues };
  // };
  style?: Record<string, any>;
  transform?: Record<string, any>;

  // commonStyleDefinition?: IDefinition;
  // transformDefinition?: IDefinition;
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
          wrap: "nowrap",
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
          wrap: "nowrap",
          itemsGap: {
            commonValue: "",
            eachValues: [],
            type: "common",
          },
        },
      },
    ],
  },
  //...getCommonObjectPropertiesDefinition(),
];
