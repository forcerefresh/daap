import { v4 as uuid } from "uuid";
import {
  CanvasProperties,
  CanvasPropertiesTuple,
  ICoverPlacementValue,
  InputType,
  SourceImagePropertiesTuple,
  SourceImageValues,
} from "../inputs/types";
import { ISlide, SlideType } from "../store/reducers/i-slides";
import { FormType } from "../utils/form-layout/i-form-layout";
import { getObjectDefinition } from "./objects-factory";
import { createSvgObject, SVG } from "./svg/svg";
import {
  ICommonObjectProperties,
  IObject,
  ITransitions,
  NavigationEvent,
  NavigationType,
  ObjectType,
} from "./types";

/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;

/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export function createObject(
  type: ObjectType | string,
  objectProps: Partial<IObject>,
  initialValue?: {
    [key: string]: string;
  }
): Omit<IObject, "layerId"> {
  switch (type) {
    case ObjectType.CANVAS: {
      return {
        ...objectProps,
        ...createCanvasObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.SOURCE_IMAGE: {
      return {
        ...objectProps,
        ...createSourceImageObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    default: {
      const objDeff = getObjectDefinition(type);

      return {
        ...objectProps,
        ...objDeff!.createObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
  }
}

export function getDefaultSlide(name: string, slideType: SlideType): ISlide {
  return {
    id: uuid(),
    customId: "",
    name,
    duration: {
      inheritFrom: "inherit",
      customValue: "20s",
    },
    layerIds: [],
    nextLayerIdCounter: 1,
    slideType,
    transitions: getDefaultTransitionsForSlide(),
  };
}

export function getDefaultTransitionsForObject(): ITransitions {
  return {
    in: [],
    out: [],
    effect: [],
  };
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

export function createCommonObject(
  type: ObjectType | string
): Omit<IObject, keyof ICommonObjectProperties | "layerId" | "definition"> {
  return {
    id: uuid(),
    name: "", // will be over written
    type: type,
    isVisible: true,
    isLocked: false,
    transitions: getDefaultTransitionsForObject(),
    selfSize: false,
    //nav
    navigationDefinition: {
      values: {
        navigationType: NavigationType.None,
        linkEvent: NavigationEvent.click,
        linkTarget: "_blank",
        linkHref: "",
        slideEvent: NavigationEvent.click,
        slideReferenceType: "slideNo",
        slideNo: "1",
        slideId: "",
      },
      valuesMetadata: {},
    },
    //layout
    supportedLayout: {
      none: false,
      absolute: true,
      fit: true,
      grid: true,
      snap: true,
    },
    layout: "absolute",
    absoluteLayout: {
      type: "common",
      perDevice: [],
      common: {
        deviceType: "common",
        left: 100,
        top: 100,
        width: 200,
        height: 200,
      },
    },
    gridLayouts: {
      type: "common",
      perDevice: [],
      common: {
        deviceType: "common",
        left: 1,
        right: 3,
        top: 1,
        bottom: 2,
      },
    },
    snapLayout: {
      edge: "left",
      relativeTo: "stage",
      type: "common",
      perDevice: [],
      common: {
        deviceType: "common",
        gap: 0,
        width: "200px",
        height: "200px",
      },
    },
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
  const object = createCommonObject(ObjectType.SOURCE_IMAGE);

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
      value: {
        url: initialValue?.url || "",
        width: 300,
        height: 300,
        isPlaceholder: !initialValue?.url,
      },
      defaultValue: {
        url: "",
        width: 300,
        height: 300,
        isPlaceholder: true,
      },
    },
  ];

  const values: SourceImageValues = {
    id: "",
    visible: true,
    placement: initialValue?.placement || getDefaultCoveragePlacement(),
    url: {
      url: initialValue?.url || "",
      width: 300,
      height: 300,
      isPlaceholder: !initialValue?.url,
    },
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.SOURCE_IMAGE,
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
  const object = createCommonObject(ObjectType.CANVAS);

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
      type: ObjectType.CANVAS,
      properties,
      values,
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

export function getOverflowOptions() {
  return [
    { label: "Visible", value: "visible" },
    { label: "Hidden", value: "hidden" },
    { label: "Scroll", value: "scroll" },
    { label: "Auto", value: "auto" },
  ];
}
