import { forOwn, mapValues, pick } from "lodash-es";
import React from "react";
import {
  ButtonValues,
  CanvasValues,
  IBoxValue,
  ICornerRadiusValue,
  ICoverPlacementValue,
  ImageValues,
  SourceImageValues,
  SvgValues,
  TextValues,
} from "../inputs/types";
import { IObject, ObjectType } from "../objects/types";
import { calculateObjectSize } from "../panels/stage-panel/StagePanelUtils";
import { ILayer, ILayers } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { ISlide, ISlides } from "../store/reducers/i-slides";
import { BreakpointConfiguration } from "../store/reducers/settings";
import { IPreviewScope } from "../store/reducers/stage";
import { nl2br } from "../utils/doom-utils/common";
import {
  IPlayerData,
  ISlideData,
  ISources,
  ITransitionsData,
} from "./i-export-html";

export function generatePlayerData(
  sources: ISources,
  scope: IPreviewScope | null,
  breakpointConfig: BreakpointConfiguration
): IPlayerData {
  const { slides, layers, objects } = sources;

  const slideIds: string[] = [];

  let previewSlidesArr: ISlide[] = [];
  switch (scope?.entityType) {
    case "slide": {
      previewSlidesArr = getSlideArr(slides).filter(
        (slide) => slide.id === scope?.entityId
      );
      break;
    }
    default: {
      previewSlidesArr = getSlideArr(slides);
      break;
    }
  }

  const slideDataArr: ISlideData[] = [];

  let html = "<div class='slidesHolder'>"; // slides holder open

  previewSlidesArr.forEach((slide) => {
    const transitionsData: ITransitionsData[] = [];
    const slideData: ISlideData = {
      slide: pick(slide, ["id", "slideType", "slideTransition", "duration"]),
      transitionsData,
    };

    let slideStyle = "";
    slideStyle += "position: absolute;";

    html += "  <div style='" + slideStyle + "' class='slide-" + slide.id + "'>"; // slide open
    slideIds.push(slide.id);

    const layerArr: ILayer[] = getLayerArr(layers, slide.layerIds);
    layerArr.forEach((layer) => {
      const layerClassName = "layer-" + layer.id;
      transitionsData.push({
        objectClass: layerClassName,
        transitions: layer.transitions,
        events: [],
        data: {
          slideDuration: slide.duration,
          objectWidth: 1000,
          objectHeight: 500,
          objectLeft: 0,
          objectTop: 0,
          overflow: "",
          objectHtml: " ",
        },
      });

      // TODO: IMPORTANT
      // IMPORTANT: !!!!!! SIZE HARDCODED
      html += `    <div class="${layerClassName}" style="width:1000px; height: 500px">`; // layer open

      const objectArr = getObjectArr(objects, layer.objectIds);
      objectArr.forEach((object) => {
        const objectValues = object.definition.values;

        const objectClass = "object-" + object.id;

        // >> "left", "top", "width", "height"
        const sizeObj = pick(object, "left", "top", "width", "height");
        const objectStyle = mapValues(sizeObj, (size) => `${size}px`);

        // TODO: IMPORTANT (size issue)
        const calculatedObjectSize = calculateObjectSize(
          object,
          breakpointConfig,
          { resetPosition: false }
        );

        let style = "";
        forOwn(calculatedObjectSize, function (value, key) {
          style += key + ":" + value + ";";
        });
        style += "position: absolute;";
        const overflow = objectValues.overflow;
        style += `overflow: ${overflow};`;
        // << "left", "top", "width", "height"

        const wrapperStyle = style;
        style +=
          "position: relative; left:initial; top: initial; overflow: visible";

        html += `      <div class="object" style='${wrapperStyle}'>`; // open object wrapper
        html += `      <div class="object ${objectClass}" style='${style}'>`; // open object

        //console.log(object);
        const objectHtml = getObjectHtml(object, calculatedObjectSize, true);

        transitionsData.push({
          objectClass: objectClass,
          transitions: object.transitions,
          events: object.events,
          data: {
            slideDuration: slide.duration,
            // TODO: IMPORTANT (size issue)
            objectWidth: parseInt(calculatedObjectSize!.width + "", 10),
            objectHeight: parseInt(calculatedObjectSize!.height + "", 10),
            objectLeft: parseInt(calculatedObjectSize!.left + "", 10),
            objectTop: parseInt(calculatedObjectSize!.top + "", 10),
            overflow,
            objectHtml,
          },
        });
        html += objectHtml;

        html += "      </div>"; // object close
        html += "      </div>"; // object close wrapper
      });

      html += "    </div>"; // layer close
    });

    html += "  </div>"; // slide close

    slideDataArr.push(slideData);
  });

  html += "</div>"; //slides holder close

  return { html, slideDataArr };
}

/**
 * Returns array of slides from store>slides
 */
function getSlideArr(slides: ISlides): ISlide[] {
  return slides.allSlides.map((slideId) => slides.slideById[slideId]);
}

/**
 * Returns array of layers from store>layers
 */
function getLayerArr(layers: ILayers, layerIds: string[]): ILayer[] {
  return layerIds.map((layerId) => layers.layerById[layerId]);
}

/**
 * Returns array of object from store>objects
 */
function getObjectArr(objects: IObjects, objectIds: string[]): IObject[] {
  return objectIds.map((objectId) => objects.objectById[objectId]);
}

export function getObjectHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  switch (object.type) {
    case ObjectType.TEXT:
      return getTextHtml(object, calculatedObjectSize);
    case ObjectType.IMAGE:
      return getImageHtml(object, calculatedObjectSize);
    case ObjectType.VIDEO:
      return getVideoHtml(object, calculatedObjectSize, isPlayer);
    case ObjectType.SVG:
      return getSvgHtml(object, calculatedObjectSize);
    case ObjectType.CANVAS:
      return getCanvasHtml(object, calculatedObjectSize, isPlayer);
    case ObjectType.BUTTON:
      return getButtonHtml(object, calculatedObjectSize);
    case ObjectType.SOURCE_IMAGE:
      return getSourceImageHtml(object, calculatedObjectSize, isPlayer);
    default:
      return "";
  }
}

// OBJECT HTML CREATOR FUNCTIONS **********************

export function getTextHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const textProperties = object.definition.values as TextValues;

  let style = "";
  style += "font-family: " + textProperties.font.fontFamily + ";";
  style += "font-size: " + textProperties.fontSize + ";";
  const c = textProperties.color;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += "font-weight: " + textProperties.weight + ";";
  style += "width: " + calculatedObjectSize.width + ";";
  style += "height:" + calculatedObjectSize.height + ";";
  style += "position: absolute;";

  return `<p class="object-content" style="${style}">${nl2br(
    textProperties.text
  )}</p>`;
}

export function getButtonHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const buttonProperties = object.definition.values as ButtonValues;

  let style = "";

  // text properties
  style += "font-family: " + buttonProperties.font.fontFamily + ";";
  style += "font-size: " + buttonProperties.fontSize + ";";
  const fc = buttonProperties.fontColor;
  style += `color: rgba(${fc?.r},${fc?.g},${fc?.b},${fc?.a});`;
  style += "font-weight: " + buttonProperties.fontWeight + ";";
  //
  const bgc = buttonProperties.backgroundColor;
  style += `background-color: rgba(${bgc?.r},${bgc?.g},${bgc?.b},${bgc?.a});`;

  if (buttonProperties.hasBorder) {
    style = addBorderBox(style, buttonProperties.borderSize);

    style += `border-style: ${buttonProperties.borderStyle};`;
    const bc = buttonProperties.borderColor;
    style += `border-color: rgba(${bc?.r},${bc?.g},${bc?.b},${bc?.a});`;
    style = addBorderRadius(style, buttonProperties.borderRadius);
  } else {
    style += "border-style: none;";
  }

  switch (buttonProperties.sizeType) {
    case "padding": {
      style = addPaddingBox(style, buttonProperties.sizePadding);
      break;
    }
    case "size": {
      style += `width: ${buttonProperties.sizeWidth};`;
      style += `height: ${buttonProperties.sizeHeight};`;
      break;
    }
  }

  style += "position: absolute;";
  style += "white-space: nowrap;";
  return `<button class="object-content" style="${style}">${nl2br(
    buttonProperties.text
  )}</button>`;
}

function getImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const imageProperties = object.definition.values as ImageValues;

  if (imageProperties.url.isPlaceholder) {
    return `<div style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">IMAGE<br/>PLACEHOLDER</div>`;
  }

  const coverPlacementValue = imageProperties.fit as ICoverPlacementValue;

  let backgroundSize = coverPlacementValue.size as
    | "cover"
    | "fit"
    | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fit") backgroundSize = "100% 100%";
  const aH = coverPlacementValue.positionHorizontal;
  const aV = coverPlacementValue.positionVertical;

  //let style = "";
  //style += addCommonPropertiesToStyle(style, object);
  //return `<img class="object-content" style="${style}" src="${imageProperties.url.value.url}" width="${object.width}" height="${object.height}"/>`;

  let style = "";
  style += addCommonPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${imageProperties.url.url}');`;
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  return `<div class="object-content" style="${style}"></div>`;
}

/*function getCoverImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const imageProperties = object.definition.properties as CoverImageProperties;

  // if placeholder
  if (imageProperties.url.value.isPlaceholder) {
    return `<div class="object-content" style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">COVER IMAGE<br/>PLACEHOLDER</div>`;
  }

  let backgroundSize = (imageProperties.placement.value as ICoverPlacementValue)
    .size as "cover" | "fit" | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fit") backgroundSize = "100% 100%";
  const aH = (imageProperties.placement.value as ICoverPlacementValue)
    .positionHorizontal;
  const aV = (imageProperties.placement.value as ICoverPlacementValue)
    .positionVertical;

  let style = "";
  style += addCommonPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${imageProperties.url.value.url}');`;
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  return `<div class="object-content" style="${style}"></div>`;
}
*/
/*
function getGridImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const imageProperties = object.definition.properties as GridImageProperties;

  // if placeholder
  if (imageProperties.url.value.isPlaceholder) {
    return `<div class="object-content" style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">GRID IMAGE<br/>PLACEHOLDER</div>`;
  }

  //TMP
  const backgroundSize = "cover";
  const aH = "center";
  const aV = "center";

  let style = "";
  style += addCommonPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${imageProperties.url.value.url}');`;
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  return `<div class="object-content" style="${style}"></div>`;
}*/

function getSourceImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const imageProperties = object.definition.values as SourceImageValues;

  if (imageProperties.url.isPlaceholder) {
    return `<div class="object-content" style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">IMAGE<br/>PLACEHOLDER</div>`;
  }

  let backgroundSize = (imageProperties.placement as ICoverPlacementValue)
    .size as "cover" | "fit" | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fit") backgroundSize = "100% 100%";
  const aH = (imageProperties.placement as ICoverPlacementValue)
    .positionHorizontal;
  const aV = (imageProperties.placement as ICoverPlacementValue)
    .positionVertical;

  let style = "";
  style += addCommonPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${imageProperties.url.url}');`;
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;
  style += `opacity: ${imageProperties.visible ? 1 : 0};`;

  return `<div class="object-content" style="${style}"><img style="opacity:0;" id="${imageProperties.id}" src="${imageProperties.url.url}"></div>`;
}

function getVideoHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const imageProperties = object.definition.values as ImageValues;

  if (imageProperties.url.isPlaceholder) {
    return `<div style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">VIDEO<br/>PLACEHOLDER</div>`;
  }

  let style = "";
  style += "object-fit: fill;";

  let attrs = "";
  if (isPlayer) attrs += " autoplay controls";
  attrs += ` width="100%"`;
  attrs += ` height="100%"`;

  const url = imageProperties.url.url;

  const videoHtml = `<video style="${style}" ${attrs}><source src="${url}" type="video/mp4"></video>`;

  return videoHtml;

  //return `<img class="object-content" src="${imageProperties.url.value.url}" width="${object.width}" height="${object.height}"/>`;
}

function getSvgHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const imageProperties = object.definition.values as SvgValues;

  if (imageProperties.svg) {
    return imageProperties.svg;
  }
  return ``;
}

function getCanvasHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const canvasProperties = object.definition.values as CanvasValues;

  let style = "";
  console.log(object);
  style += addCommonPropertiesToStyle(style, object);
  style += "position: absolute;";
  if (!isPlayer) {
    style += "background-color: rgba(255,255,255,0.2);";
  }
  return `<canvas width="${object.width}" height="${object.height}" class="object-content" style="${style}"/>`;
}

// UTILS FUNCTIONS **************

function addCommonPropertiesToStyle(style: string, object: IObject) {
  console.log(object.commonProperties);
  if (object.commonProperties?.borderRadius) {
    style = addBorderRadius(style, object.commonProperties?.borderRadius);
  }

  console.log(style);
  return style;
}

function addBorderBox(style: string, boxValue: IBoxValue) {
  if (boxValue.common) {
    style += "border-width: " + boxValue.common + ";";
  } else if (boxValue.t) {
    style +=
      "border-width: " +
      boxValue.t +
      " " +
      boxValue.r +
      " " +
      boxValue.b +
      " " +
      boxValue.l +
      ";";
  }
  return style;
}

function addPaddingBox(style: string, boxValue: IBoxValue) {
  if (boxValue.common) {
    style += "padding: " + boxValue.common + ";";
  } else if (boxValue.t) {
    style +=
      "padding: " +
      boxValue.t +
      " " +
      boxValue.r +
      " " +
      boxValue.b +
      " " +
      boxValue.l +
      ";";
  }
  return style;
}

function addBorderRadius(style: string, borderRadius: ICornerRadiusValue) {
  if (borderRadius.common) {
    style += "border-radius: " + borderRadius.common + ";";
  } else if (borderRadius.tl) {
    style +=
      "border-radius: " +
      borderRadius.tl +
      " " +
      borderRadius.tr +
      " " +
      borderRadius.br +
      " " +
      borderRadius.bl +
      ";";
  }
  return style;
}
