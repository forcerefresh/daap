import { debug } from "console";
import { forOwn, mapValues, pick } from "lodash-es";
import React from "react";
import {
  ButtonProperties,
  CanvasProperties,
  ICoverPlacementValue,
  ImageProperties,
  SourceImageProperties,
  SvgProperties,
  TextProperties,
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
        const overflow = (object.definition.properties as any).overflow.value;
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
  const textProperties = object.definition.properties as TextProperties;

  let style = "";
  style += "font-family: " + textProperties.font.value.fontFamily + ";";
  style += "font-size: " + textProperties.fontSize.value + ";";
  const c = textProperties.color.value;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += "font-weight: " + textProperties.weight.value + ";";
  style += "width: " + calculatedObjectSize.width + ";";
  style += "height:" + calculatedObjectSize.height + ";";
  style += "position: absolute;";

  return `<p class="object-content" style="${style}">${nl2br(
    textProperties.text.value
  )}</p>`;
}

export function getButtonHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const buttonProperties = object.definition.properties as ButtonProperties;

  let style = "";
  const c = buttonProperties.backgroundColor.value;
  style += `background-color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += `border: ${buttonProperties.borderSize.value}px solid red;`;
  style += "position: absolute;";
  return `<button class="object-content" style="${style}">${nl2br(
    "Sample button"
  )}</button>`;
}

function getImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const imageProperties = object.definition.properties as ImageProperties;

  if (imageProperties.url.value.isPlaceholder) {
    return `<div style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">IMAGE<br/>PLACEHOLDER</div>`;
  }

  const coverPlacementValue = imageProperties.fit.value as ICoverPlacementValue;

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
  style += `background-image:url('${imageProperties.url.value.url}');`;
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
  const imageProperties = object.definition.properties as SourceImageProperties;
  if (imageProperties.url.value.isPlaceholder) {
    return `<div class="object-content" style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">IMAGE<br/>PLACEHOLDER</div>`;
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
  style += `opacity: ${imageProperties.visible.value ? 1 : 0};`;

  return `<div class="object-content" style="${style}"><img style="opacity:0;" id="${imageProperties.id.value}" src="${imageProperties.url.value.url}"></div>`;
}

function getVideoHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const imageProperties = object.definition.properties as ImageProperties;

  if (imageProperties.url.value.isPlaceholder) {
    return `<div style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">VIDEO<br/>PLACEHOLDER</div>`;
  }

  let style = "";
  style += "object-fit: fill;";

  let attrs = "";
  if (isPlayer) attrs += " autoplay controls";
  attrs += ` width="100%"`;
  attrs += ` height="100%"`;

  const url = imageProperties.url.value.url;

  const videoHtml = `<video style="${style}" ${attrs}><source src="${url}" type="video/mp4"></video>`;

  return videoHtml;

  //return `<img class="object-content" src="${imageProperties.url.value.url}" width="${object.width}" height="${object.height}"/>`;
}

function getSvgHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const imageProperties = object.definition.properties as SvgProperties;
  if (imageProperties.svg.value) {
    return imageProperties.svg.value;
  }
  return ``;
}

function getCanvasHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const canvasProperties = object.definition.properties as CanvasProperties;

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
    if (object.commonProperties?.borderRadius.common) {
      style +=
        "border-radius: " + object.commonProperties?.borderRadius.common + ";";
    } else if (object.commonProperties?.borderRadius.tl) {
      style +=
        "border-radius: " +
        object.commonProperties?.borderRadius.tl +
        " " +
        object.commonProperties?.borderRadius.tr +
        " " +
        object.commonProperties?.borderRadius.br +
        " " +
        object.commonProperties?.borderRadius.bl +
        ";";
    }
  }

  console.log(style);
  return style;
}
