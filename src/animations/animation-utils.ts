import { CSSProperties } from "react";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import {
  addCommonPropertiesToCSSProperties,
  addTransformPropertiesToCSSProperties,
} from "../objects/common-properties-player-obj";

export function getObjectElementById(id: string): HTMLDivElement {
  const el = document.getElementsByClassName(
    `object-${id}`,
  )[0] as HTMLDivElement;
  return el;
}

export function getObjectOrLayerElementById(id: string): HTMLDivElement {
  return (document.getElementsByClassName(`object-${id}`)[0] ||
    document.getElementsByClassName(`layer-${id}`)[0]) as HTMLDivElement;
}

export function getObjectWrapperElementById(id: string): HTMLDivElement {
  const el = document.getElementsByClassName(
    `object-wrapper-${id}`,
  )[0] as HTMLDivElement;
  return el;
}

export function addCommonStyleToObjectElementContent(
  objectContentEl: HTMLElement,
  style?: Record<string, any>,
  deviceType?: DeviceType,
) {
  const cssProperties: CSSProperties = {};
  addCommonPropertiesToCSSProperties(
    cssProperties,
    // commonStyleDefinition?.values,
    // commonStyleDefinition?.valuesMetadata,
    // deviceType
  );

  Object.keys(cssProperties).forEach((key) => {
    objectContentEl.style[key as any] = (cssProperties as any)[key];
  });
}

export function addTransformStyleToObjectElementContent(
  objectContentEl: HTMLElement,
  style?: Record<string, any>,
  deviceType?: DeviceType,
) {
  const cssProperties: CSSProperties = {};
  addTransformPropertiesToCSSProperties(
    cssProperties,
    // commonStyleDefinition?.values,
    // commonStyleDefinition?.valuesMetadata,
    // deviceType
  );

  Object.keys(cssProperties).forEach((key) => {
    objectContentEl.style[key as any] = (cssProperties as any)[key];
  });
}

// export function getAnimationElementById(
//   id: string,
//   animationId: string
// ): HTMLDivElement {
//   const el = document.getElementsByClassName(
//     `animation-wrapper-${animationId}-${id}`
//   )[0] as HTMLDivElement;
//   return el;
// }

export function getLayerWrapperElementById(id: string): HTMLDivElement {
  const el = document.getElementsByClassName(
    `layer-wrapper-${id}`,
  )[0] as HTMLDivElement;
  return el;
}

export function getLayerElementById(id: string): HTMLDivElement {
  const el = document.getElementsByClassName(
    `layer-${id}`,
  )[0] as HTMLDivElement;
  return el;
}

// used for all tiles animations
export function getParameters(
  rows: number,
  columns: number,
  startFrom: string,
) {
  switch (startFrom) {
    case "random":
      return { stagger: { from: "random" } };
    case "center":
      return {
        stagger: {
          from: "center",
        },
      };
    case "horizontal-center":
      return {
        stagger: {
          from: "center",
          axis: "y",
        },
      };
    case "vertical-center":
      return {
        stagger: {
          from: "center",
          axis: "x",
        },
      };
    case "edges":
      return { stagger: { from: "edges" } };
    case "horizontal-edges":
      return {
        stagger: {
          from: "edges",
          axis: "y",
        },
      };
    case "vertical-edges":
      return {
        stagger: {
          from: "edges",
          axis: "x",
        },
      };
    case "top-left":
      return {
        stagger: {
          from: "0",
        },
      };
    case "top-right":
      return {
        stagger: {
          from: `${columns - 1}`,
        },
      };
    case "bottom-left":
      return {
        stagger: {
          from: `${columns * (rows - 1)}`,
        },
      };
    case "bottom-right":
      return {
        stagger: {
          from: `${columns * rows - 1}`,
        },
      };
  }
}
