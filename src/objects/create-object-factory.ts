import { v4 as uuid } from "uuid";
import {
  CanvasProperties,
  CanvasPropertiesTuple,
  ICoverPlacementValue,
  InputType,
  SourceImagePropertiesTuple,
  SourceImageValues,
} from "webslider-sdk/lib/inputs/i-inputs";
import { ISlide, SlideType } from "../store/reducers/i-slides";
import { FormType } from "webslider-sdk/lib/form/i-form-layout";
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

/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;

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
        ...createCanvasObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case "source_image": {
      return {
        ...objectProps,
        ...createSourceImageObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case "group": {
      return {
        ...objectProps,
        ...createGroupObject(initialValue, {
          hasOverflowProperty: true,
        }),
        transformDefinition: {
          properties: [...getTransformObjectPropertiesDefinition(true)],
          values: { ...getTransformPropertiesValues() },
          valuesMetadata: {},
        },
        type: "group",
      };
    }
    default: {
      const objDeff = getAppObjectDefinition(type);

      return {
        ...objDeff!.createObject({
          ...initialValue,
          commonProperties: {
            hasOverflowProperty: true,
          },
        }),
        ...objectProps,
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
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
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
      value: { image: {} }, // TODO: IMPORTANT
      defaultValue: { image: {} }, // TODO: IMPORTANT
    },
  ];

  const values: SourceImageValues = {
    id: "",
    visible: true,
    placement: initialValue?.placement || getDefaultCoveragePlacement(),
    url: { image: {} },
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
  };
}

function createCanvasObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
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
  };
}

function createGroupObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
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
  };
}

/* NOTE: consider moving to sibling file (...utils file) */

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

export function getDefaultSlide(slideType: SlideType, name?: string): ISlide {
  return {
    id: uuid(),
    customId: "",
    name,
    // duration: {
    //   inheritFrom: "inherit",
    //   customValue: "20s",
    // },
    // exitDuration: {
    //   inheritFrom: "inherit",
    //   customValue: "1s",
    // },
    layerIds: [],
    nextLayerIdCounter: 1,
    slideType,
    // transitionEnabled: false,
    // transitionOverlapTime: "1000ms",
    // transitionDurationTime: "1000ms",
    // transitions: getDefaultTransitionsForSlide(),
    // moveToTop: true,
  };
}
