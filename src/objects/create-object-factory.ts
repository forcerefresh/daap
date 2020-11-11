import { v4 as uuid } from "uuid";
import { InputType, TextProperties } from "../inputs/types";
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
  type: ObjectType.TEXT,
  objectProps: Partial<IObject>
): Omit<IObject, "layerId"> {
  switch (type) {
    case ObjectType.TEXT: {
      return { ...objectProps, ...createTextObject() };
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

function createCommonObject(): Omit<
  IObject,
  keyof ICommonObjectProperties | "layerId" | "definition"
> {
  return {
    id: uuid(),
    type: ObjectType.TEXT,
    isVisible: true,
    isLocked: false,
    // hasTimeline: true,
    transitions: {
      in: {
        relativeTo: "stage",
        delay: 500,
        duration: 1500,
        effect: {
          alias: "slideFromBottomLeft",
          properties: {},
        },
      },
    },
  };
}

function createTextObject(): Omit<
  IObject<TextProperties>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject();

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.TEXT,
      properties: {
        color: {
          displayName: "Color",
          propertyName: "color",
          inputType: InputType.COLOR,
          value: null,
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        fontSize: {
          displayName: "Font size",
          propertyName: "string",
          inputType: InputType.TEXT,
          value: "S",
          defaultValue: "A",
        },
        weight: {
          displayName: "Weight",
          propertyName: "weight",
          inputType: InputType.SELECT,
          value: "2",
          defaultValue: "3",
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
/*
function createImageObject() {
  // TODO
  return {};
}

function createVideoObject() {
  // TODO
  return {};
}

function createVectorObject() {
  // TODO
  return {};
}*/
