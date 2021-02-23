import { forEach, forIn } from "lodash-es";
import { v4 as uuid } from "uuid";
import {
  IFontSelectInputValue,
  ImageProperties,
  InputType,
  TextProperties,
} from "../inputs/types";
import { ICommonObjectProperties, IObject, ObjectType } from "./types";

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
      return { ...objectProps, ...createTextObject(initialValue) };
    }
    case ObjectType.IMAGE: {
      return { ...objectProps, ...createImageObject() };
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

function createCommonObject(
  type: ObjectType
): Omit<IObject, keyof ICommonObjectProperties | "layerId" | "definition"> {
  return {
    id: uuid(),
    type: type,
    isVisible: true,
    isLocked: false,
    transitions: {
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
    },
  };
}

function createTextObject(initialValue?: {
  [key: string]: any;
}): Omit<IObject<TextProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.TEXT);

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.TEXT,
      properties: {
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
        fontSize: {
          displayName: "Font size",
          propertyName: "string",
          inputType: InputType.TEXT,
          value: (initialValue?.fontSize as string) || "14",
          defaultValue: "14",
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

function createImageObject(): Omit<
  IObject<ImageProperties>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(ObjectType.IMAGE);

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.IMAGE,
      properties: {
        url: {
          displayName: "Image url",
          propertyName: "url",
          inputType: InputType.IMAGE,
          value: { url: "", width: 300, height: 300, isPlaceholder: true },
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

/*
function createVideoObject() {
  // TODO
  return {};
}

function createVectorObject() {
  // TODO
  return {};
}*/
