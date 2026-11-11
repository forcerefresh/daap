import { v4 as uuid } from "uuid";
import {
  CanvasProperties,
  CanvasPropertiesTuple,
  ICoverPlacementValue,
  IImageInputValue,
  InputType,
  SourceImagePropertiesTuple,
  SourceImageValues,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IPage, PageType } from "../store/reducers/i-pages";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { createSvgObject, SVG } from "./svg/svg";
import {
  ICommonObjectProperties,
  IObject,
  ITransitions,
} from "webslider-sdk/lib/objects/i-object";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";

export function createObject(
  type: string,
  objectProps: Partial<IObject>,
  initialValue?: {
    [key: string]: string;
  }
): Omit<IObject, "layerId"> {
  switch (type) {
    case "canvas": {
      return {
        ...objectProps,
        ...createCanvasObject(initialValue),
      };
    }
    case "source_image": {
      return {
        ...objectProps,
        ...createSourceImageObject(initialValue),
      };
    }
    case "group": {
      return {
        ...objectProps,
        ...createGroupObject(initialValue),
        transformDefinition: {
          properties: [...getTransformObjectPropertiesDefinition(true)],
          values: { ...getTransformPropertiesValues() },
          valuesMetadata: {},
        },
        type: "group",
      } as unknown as Omit<IObject, "layerId">;
    }
    default: {
      const objDeff = getAppObjectDefinition(type, "latest");

      return {
        ...objDeff!.createObject({
          ...initialValue,
          commonProperties: {
            hasOverflowProperty: true,
          },
        }),
        ...objectProps,
        version: objDeff?.version,
      };
    }
  }
}

export function getDefaultTransitionsForLayer(): ITransitions {
  return {
    in: [],
    out: [],
    layer: [],
  };
}

export function getDefaultTransitionsForSlide(): ITransitions {
  return {
    slide: [],
  };
}

function createSourceImageObject(
  initialValue?: {
    [key: string]: any;
  }
): Omit<
  IObject<SourceImagePropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject("source_image");

  const properties: SourceImagePropertiesTuple = [
    {
      displayName: "Identifier",
      propertyName: "id",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "Visible",
      propertyName: "visible",
      inputType: InputType.CHECKBOX,
      value: true,
      defaultValue: true,
    },
    {
      displayName: "Placement",
      propertyName: "placement",
      inputType: InputType.COVER_LAYOUT,
      value: initialValue?.placement || getDefaultCoveragePlacement(),
      defaultValue: getDefaultCoveragePlacement(),
    },
    {
      displayName: "Image url",
      propertyName: "url",
      inputType: InputType.IMAGE,
      value: { image: {} } as unknown as IImageInputValue, // TODO: IMPORTANT
      defaultValue: { image: {} } as unknown as IImageInputValue, // TODO: IMPORTANT
    },
  ];

  const values: SourceImageValues = {
    id: "",
    visible: true,
    placement: initialValue?.placement || getDefaultCoveragePlacement(),
    url: { image: {} } as unknown as IImageInputValue,
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: "source_image",
      properties,
      values,
      valuesMetadata: {},
    },
  } as unknown as Omit<IObject<SourceImagePropertiesTuple>, keyof ICommonObjectProperties | "layerId">;
}

function createCanvasObject(
  _initialValue?: {
    [key: string]: any;
  }
): Omit<IObject<CanvasProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject("canvas");

  const properties: CanvasPropertiesTuple = [
    {
      displayName: "Source",
      propertyName: "source",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
  ];

  const values = {
    svg: "",
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: "canvas",
      properties,
      values,
      valuesMetadata: {},
    },
  } as unknown as Omit<IObject<CanvasProperties>, keyof ICommonObjectProperties | "layerId">;
}

function createGroupObject(
  _initialValue?: {
    [key: string]: any;
  }
): Omit<IObject<CanvasProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject("group");

  return {
    ...object,
    definition: {
      id: uuid(),
      type: "group",
      properties: [],
      values: {},
      valuesMetadata: {},
    },
  } as unknown as Omit<IObject<CanvasProperties>, keyof ICommonObjectProperties | "layerId">;
}

function getDefaultCoveragePlacement(): ICoverPlacementValue {
  return {
    size: "cover",
    positionHorizontal: "center",
    positionVertical: "center",
  };
}

export function getBorderOptions() {
  return [
    { label: "solid", value: "solid" },
    { label: "dotted", value: "dotted" },
    { label: "dashed", value: "dashed" },
    { label: "double", value: "double" },
    { label: "groove", value: "groove" },
    { label: "ridge", value: "ridge" },
    { label: "inset", value: "inset" },
    { label: "outset", value: "outset" },
    { label: "none", value: "none" },
    { label: "hidden", value: "hidden" },
  ];
}

export function getDefaultSlide(pageType: PageType, name?: string): IPage {
  return {
    id: uuid(),
    name,
    layerIds: [],
    nextLayerNameNumber: 1,
    ...(pageType === PageType.Normal ? {} : { type: pageType }),
  };
}
