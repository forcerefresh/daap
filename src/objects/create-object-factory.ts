import { forEach, forIn } from "lodash-es";
import { v4 as uuid } from "uuid";
import {
  IFontSelectInputValue,
  ImageProperties,
  InputType,
  SvgProperties,
  TextProperties,
  VideoProperties,
} from "../inputs/types";
import {
  ICommonObjectProperties,
  IObject,
  ISlideTransition,
  ITransitions,
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
  type: ObjectType,
  objectProps: Partial<IObject>,
  initialValue?: {
    [key: string]: string;
  }
): Omit<IObject, "layerId"> {
  switch (type) {
    case ObjectType.TEXT: {
      return {
        ...objectProps,
        ...createTextObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.IMAGE: {
      return {
        ...objectProps,
        ...createImageObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.VIDEO: {
      return {
        ...objectProps,
        ...createVideoObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.SVG: {
      return {
        ...objectProps,
        ...createSvgObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.HTML: {
      return {
        ...objectProps,
        ...createSvgObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    /*case ObjectType.IMAGE: {
      return createImageObject();
    }
    case ObjectType.VIDEO: {
      return createVideoObject();
    }
    case ObjectType.VECTOR: {
      return createVectorObject();
    }*/
  }
}

export function getDefaultSlideTransition(): ISlideTransition {
  return {
    duration: 2000,
    overlap: 1000,
    effect: {
      id: "none",
      values: {},
    },
  };
}

export function getDefaultTransitionsForObject(): ITransitions {
  return {
    in: {
      relativeTo: "stage",
      delay: 0,
      duration: 1000,
      ease: "none",
      timeDistribution: 50,
      effect: {
        id: "none",
        values: {},
      },
    },
    out: {
      relativeTo: "stage",
      delay: 0,
      duration: 1000,
      ease: "none",
      timeDistribution: 50,
      effect: {
        id: "none",
        values: {},
      },
    },
    effect: {
      relativeTo: "stage",
      delay: 0,
      duration: -1,
      ease: "none",
      timeDistribution: 50,
      effect: {
        id: "none",
        values: {},
      },
    },
  };
}

export function getDefaultTransitionsForLayer(): ITransitions {
  return {
    layer: {
      relativeTo: "stage",
      delay: 0,
      duration: 1000,
      ease: "none",
      timeDistribution: 50,
      effect: {
        id: "none",
        values: {},
      },
    },
  };
}

function createCommonObject(
  type: ObjectType
): Omit<IObject, keyof ICommonObjectProperties | "layerId" | "definition"> {
  return {
    id: uuid(),
    name: "", // will be over written
    type: type,
    isVisible: true,
    isLocked: false,
    transitions: getDefaultTransitionsForObject(),
    events: [],
  };
}

function createTextObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<TextProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.TEXT);

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.TEXT,
      properties: {
        ...(commonProperties?.hasOverflowProperty
          ? {
              overflow: {
                displayName: "Overflow",
                propertyName: "overflow",
                inputType: InputType.SELECT,
                value: "visible",
                defaultValue: "visible",
                options: [
                  { value: "visible", label: "visible" },
                  { value: "hidden", label: "hidden" },
                ],
              },
            }
          : {}),
        fontSize: {
          displayName: "Font size",
          placeholderText: "Enter font size",
          allowedUnits: ["px", "em", "%"],
          propertyName: "string",
          inputType: InputType.UNITS_NUMBER,
          value: initialValue?.fontSize || "1em",
          defaultValue: "1em",
        },
        text: {
          displayName: "Text",
          propertyName: "text",
          inputType: InputType.TEXTAREA,
          value: (initialValue?.text as string) || "",
          defaultValue: "",
        },
        autoHeight: {
          displayName: "Auto height",
          propertyName: "autoHeight",
          inputType: InputType.CHECKBOX,
          value: false,
          defaultValue: false,
        },
        font: {
          displayName: "Font",
          propertyName: "fontFamily",
          inputType: InputType.FONT_SELECT,
          value: (initialValue?.font as IFontSelectInputValue) || {
            fontFamily: "Arial",
            source: "system-fonts",
          },
          defaultValue: {
            fontFamily: "Arial",
            source: "system-fonts",
          },
        },
        color: {
          displayName: "Color",
          propertyName: "color",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
        },
        weight: {
          displayName: "Weight",
          propertyName: "weight",
          inputType: InputType.SELECT,
          value: "400",
          defaultValue: "400",
          options: [
            { value: "100", label: "100	Thin" },
            { value: "200", label: "200	Extra Light" },
            { value: "300", label: "300	Light" },
            { value: "400", label: "400	Normal" },
            { value: "500", label: "500	Medium" },
            { value: "600", label: "600	Semi Bold" },
            { value: "700", label: "700	Bold" },
            { value: "800", label: "800	Extra Bold" },
            { value: "900", label: "900	Black" },
            { value: "950", label: "950	Extra Black" },
          ],
        },
      },
    },
  };
}

function createImageObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<ImageProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.IMAGE);

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.IMAGE,
      properties: {
        ...(commonProperties?.hasOverflowProperty
          ? {
              overflow: {
                displayName: "Overflow",
                propertyName: "overflow",
                inputType: InputType.SELECT,
                value: "visible",
                defaultValue: "visible",
                options: [
                  { value: "visible", label: "visible" },
                  { value: "hidden", label: "hidden" },
                ],
              },
            }
          : {}),
        url: {
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
      },
    },
  };
}

function createVideoObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<VideoProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.VIDEO);

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.VIDEO,
      properties: {
        ...(commonProperties?.hasOverflowProperty
          ? {
              overflow: {
                displayName: "Overflow",
                propertyName: "overflow",
                inputType: InputType.SELECT,
                value: "visible",
                defaultValue: "visible",
                options: [
                  { value: "visible", label: "visible" },
                  { value: "hidden", label: "hidden" },
                ],
              },
            }
          : {}),
        url: {
          displayName: "Video url",
          propertyName: "url",
          inputType: InputType.VIDEO,
          value: { url: "", width: 960, height: 540, isPlaceholder: true },
          defaultValue: {
            url: "",
            width: 960,
            height: 540,
            isPlaceholder: true,
          },
        },
      },
    },
  };
}

function createSvgObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<SvgProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.SVG);

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.SVG,
      properties: {
        ...(commonProperties?.hasOverflowProperty
          ? {
              overflow: {
                displayName: "Overflow",
                propertyName: "overflow",
                inputType: InputType.SELECT,
                value: "visible",
                defaultValue: "visible",
                options: [
                  { value: "visible", label: "visible" },
                  { value: "hidden", label: "hidden" },
                ],
              },
            }
          : {}),
        svg: {
          displayName: "SVG code",
          propertyName: "svg",
          inputType: InputType.TEXTAREA,
          value: `<svg height="100" width="100">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`,
          defaultValue: `<svg height="100" width="100">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`,
        },
      },
    },
  };
}

/*

function createVectorObject() {
  // TODO
  return {};
}*/
