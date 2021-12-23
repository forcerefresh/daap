import { forOwn, mapValues, pick } from "lodash-es";
import React from "react";
import { RGBColor } from "react-color";
import {
  ArrowValues,
  BulletsValues,
  ButtonValues,
  CanvasValues,
  IBoxValue,
  ICornerRadiusValue,
  ICoverPlacementValue,
  IImageInputValue,
  ImageValues,
  MultiImageValues,
  SourceImageValues,
  SvgValues,
  TextValues,
} from "../inputs/types";
import { IObject, ObjectType } from "../objects/types";
import { calculateObjectSize } from "../panels/stage-panel/StagePanelUtils";
import { ILayer, ILayers, ILayerValues } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { ISlide, ISlides } from "../store/reducers/i-slides";
import { BreakpointConfiguration } from "../store/reducers/settings";
import { IPreviewScope } from "../store/reducers/stage";
import { nl2br } from "../utils/doom-utils/common";
import { getThumbnailHtmlArr } from "./export-html-utils";
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

  // generate thumbnails
  const thumbnailHtmlArr = getThumbnailHtmlArr(
    previewSlidesArr,
    layers,
    objects
  );

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
      const layerValues = layer.definition.values as ILayerValues;

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
      //html += `    <div class="${layerClassName}" style="width:1000px; height: 500px">`; // layer open
      let layerStyle = `position:absolute;`;
      //layerStyle += `border: 1px solid red;`;
      layerStyle += `overflow: ${layerValues.overflow};`;

      if (layerValues.hasLayoutChildren) {
        const t = layerValues.layoutChildren.type;
        if (t === "row" || t === "column") {
          layerStyle += "display:flex;";
          layerStyle += `align-items: ${layerValues.layoutChildren.align};`;
          layerStyle += `justify-content: ${layerValues.layoutChildren.justify};`;

          if (t === "row") {
            layerStyle += `flex-direction:row;`;
          }
          if (t === "column") {
            layerStyle += `display:flex;`;
            layerStyle += `flex-direction: column;`;
          }
        }
      }

      const calculatedLayerSize = calculateObjectSize(layer, breakpointConfig, {
        resetPosition: false,
      });
      forOwn(calculatedLayerSize, function (value, key) {
        layerStyle += key + ":" + value + ";";
      });

      html += `    <div class="${layerClassName}" style="${layerStyle}">`; // layer open

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
        style += layerValues.hasLayoutChildren
          ? "position: static;"
          : "position: relative;";
        const overflow = objectValues.overflow;
        style += `overflow: ${overflow};`;
        // << "left", "top", "width", "height"

        const wrapperStyle = style;
        style +=
          "position: relative; left:initial; top: initial; overflow: visible";

        html += `      <div class="object" style='${wrapperStyle}'>`; // open object wrapper
        html += `      <div class="object ${objectClass}" style='${style}'>`; // open object

        //console.log(object);
        const objectHtml = getObjectHtml(
          object,
          calculatedObjectSize,
          true,
          thumbnailHtmlArr,
          previewSlidesArr.length
        );

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
export function getSlideArr(slides: ISlides): ISlide[] {
  return slides.allSlides.map((slideId) => slides.slideById[slideId]);
}

/**
 * Returns array of layers from store>layers
 */
export function getLayerArr(layers: ILayers, layerIds: string[]): ILayer[] {
  return layerIds.map((layerId) => layers.layerById[layerId]);
}

/**
 * Returns array of object from store>objects
 */
export function getObjectArr(
  objects: IObjects,
  objectIds: string[]
): IObject[] {
  return objectIds.map((objectId) => objects.objectById[objectId]);
}

export function getObjectHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean,
  thumbnailHtmlArr: (string | undefined)[],
  sliderCounter = 3
) {
  switch (object.type) {
    case ObjectType.TEXT:
      return getTextHtml(object, calculatedObjectSize);
    case ObjectType.RICH_TEXT:
      return getRichTextHtml(object, calculatedObjectSize);
    case ObjectType.BULLETS:
      return getBulletsHtml(
        object,
        calculatedObjectSize,
        isPlayer,
        thumbnailHtmlArr,
        sliderCounter
      );
    case ObjectType.IMAGE:
      return getImageHtml(object, calculatedObjectSize);
    case ObjectType.MULTI_IMAGE:
      return getMultiImageHtml(object, calculatedObjectSize, isPlayer);
    case ObjectType.VIDEO:
      return getVideoHtml(object, calculatedObjectSize, isPlayer);
    case ObjectType.SVG:
      return getSvgHtml(object, calculatedObjectSize);
    case ObjectType.ARROW:
      return getArrowHtml(object, calculatedObjectSize);
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

export function getRichTextHtml(
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

  const ret = `<div class="object-content" style="${style}"> 
  ${textProperties.text} 
  </div>`;
  return ret;
}

export function getBulletsHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean,
  thumbnailHtmlArr: (string | undefined)[],
  slidesCounter = 3
) {
  const buttonProperties = object.definition.values as BulletsValues;

  let style = "";

  // text properties
  if (buttonProperties.type === "circle") {
    style += "width: " + buttonProperties.circleWidth + ";";
    style += "height: " + buttonProperties.circleWidth + ";";
  } else {
    style += "width: " + buttonProperties.rectWidth + ";";
    style += "height: " + buttonProperties.rectHeight + ";";
  }

  //

  if (buttonProperties.hasBackground) {
    switch (buttonProperties.backgroundType) {
      case "solid": {
        const bgc = buttonProperties.backgroundColor;
        style += `background-color: rgba(${bgc?.r},${bgc?.g},${bgc?.b},${bgc?.a});`;
        break;
      }
      case "gradient": {
        const bgc1 = buttonProperties.backgroundGradientColor1;
        const bgc2 = buttonProperties.backgroundGradientColor2;
        style += `background-image: linear-gradient(rgba(${bgc1?.r},${bgc1?.g},${bgc1?.b},${bgc1?.a}), rgba(${bgc2?.r},${bgc2?.g},${bgc2?.b},${bgc2?.a}));`;
        break;
      }
    }
  } else {
    style += `background: none;`;
  }

  if (buttonProperties.hasBorder) {
    style = addBorderBox(style, buttonProperties.borderSize);

    style += `border-style: ${buttonProperties.borderStyle};`;
    const bc = buttonProperties.borderColor;
    style += `border-color: rgba(${bc?.r},${bc?.g},${bc?.b},${bc?.a});`;
    style = addBorderRadius(style, buttonProperties.borderRadius);
  } else {
    style += "border-style: none;";
  }

  if (buttonProperties.type === "circle") {
    style += "border-radius: 50%;";
  }

  style += `transition-duration: ${buttonProperties.hoverTransitionDuration}ms;`;

  // HOVER START >>>>
  let cssHoverStyle = "";

  if (buttonProperties.hasHoverBorder) {
    cssHoverStyle = addBorderBox(
      cssHoverStyle,
      buttonProperties.hoverBorderSize
    );

    cssHoverStyle += `border-style: ${buttonProperties.hoverBorderStyle};`;
    const bhc = buttonProperties.hoverBorderColor;
    cssHoverStyle += `border-color: rgba(${bhc?.r},${bhc?.g},${bhc?.b},${bhc?.a});`;
    cssHoverStyle = addBorderRadius(
      cssHoverStyle,
      buttonProperties.hoverBorderRadius
    );
  } else {
    //cssHoverStyle += "border-style: none;";
  }

  if (buttonProperties.type === "circle") {
    cssHoverStyle += "border-radius: 50%;";
  }

  if (buttonProperties.hasHoverBackground) {
    switch (buttonProperties.hoverBackgroundType) {
      case "solid": {
        const hbgc = buttonProperties.hoverBackgroundColor;
        cssHoverStyle += `background-color: rgba(${hbgc?.r},${hbgc?.g},${hbgc?.b},${hbgc?.a});`;
        break;
      }
      case "gradient": {
        const hbgc1 = buttonProperties.hoverBackgroundGradientColor1;
        const hbgc2 = buttonProperties.hoverBackgroundGradientColor2;
        cssHoverStyle += `background-image: linear-gradient(rgba(${hbgc1?.r},${hbgc1?.g},${hbgc1?.b},${hbgc1?.a}), rgba(${hbgc2?.r},${hbgc2?.g},${hbgc2?.b},${hbgc2?.a}));`;
        break;
      }
    }
  } else {
    //cssHoverStyle += `background: none;`;
  }
  // HOVER END <<

  // ACTIVE START >>>>
  let cssActiveStyle = "";

  if (buttonProperties.hasActiveBorder) {
    cssActiveStyle = addBorderBox(
      cssActiveStyle,
      buttonProperties.activeBorderSize
    );

    cssActiveStyle += `border-style: ${buttonProperties.activeBorderStyle};`;
    const bhc = buttonProperties.activeBorderColor;
    cssActiveStyle += `border-color: rgba(${bhc?.r},${bhc?.g},${bhc?.b},${bhc?.a});`;
    cssActiveStyle = addBorderRadius(
      cssActiveStyle,
      buttonProperties.activeBorderRadius
    );
  } else {
    //cssActiveStyle += "border-style: none;";
  }

  if (buttonProperties.type === "circle") {
    cssActiveStyle += "border-radius: 50%;";
  }

  if (buttonProperties.hasActiveBackground) {
    switch (buttonProperties.activeBackgroundType) {
      case "solid": {
        const hbgc = buttonProperties.activeBackgroundColor;
        cssActiveStyle += `background-color: rgba(${hbgc?.r},${hbgc?.g},${hbgc?.b},${hbgc?.a});`;
        break;
      }
      case "gradient": {
        const hbgc1 = buttonProperties.activeBackgroundGradientColor1;
        const hbgc2 = buttonProperties.activeBackgroundGradientColor2;
        cssActiveStyle += `background-image: linear-gradient(rgba(${hbgc1?.r},${hbgc1?.g},${hbgc1?.b},${hbgc1?.a}), rgba(${hbgc2?.r},${hbgc2?.g},${hbgc2?.b},${hbgc2?.a}));`;
        break;
      }
    }
  } else {
    //cssHoverStyle += `background: none;`;
  }
  // ACTIVE END <<

  const css = `
  <style>
  .object-content-item-${object.id} {
    ${style}
    cursor: pointer;
    overflow: hidden;
  }
  .object-content-item-${object.id}:not(:first-child) {
    margin-left: ${buttonProperties.gap};
  }

  .object-content-item-${object.id} > div {
    background-size: ${buttonProperties.thumbnailSize};
  }

  .object-content-item-${object.id}:hover {
    ${cssHoverStyle.replaceAll(";", " !important;")}
  }

  .object-content-item-${object.id}.active {
    ${cssActiveStyle.replaceAll(";", " !important;")}
  }

  </style>`;

  let bulletsHtml = "";
  for (let i = 0; i < slidesCounter; i++) {
    bulletsHtml += `<div class="object-content-item-${object.id}">
        ${
          buttonProperties.useThumbnails && thumbnailHtmlArr?.[i]
            ? thumbnailHtmlArr?.[i]
            : ""
        }
      </div>`;
  }
  // HOVER END <<<
  return `${css}<div class="object-content object-content-${object.id} ws-bullets-navigation" style="position:absolute; display: flex;">${bulletsHtml}</div>
  `;
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

  if (buttonProperties.hasBackground) {
    switch (buttonProperties.backgroundType) {
      case "solid": {
        const bgc = buttonProperties.backgroundColor;
        style += `background-color: rgba(${bgc?.r},${bgc?.g},${bgc?.b},${bgc?.a});`;
        break;
      }
      case "gradient": {
        const bgc1 = buttonProperties.backgroundGradientColor1;
        const bgc2 = buttonProperties.backgroundGradientColor2;
        style += `background-image: linear-gradient(rgba(${bgc1?.r},${bgc1?.g},${bgc1?.b},${bgc1?.a}), rgba(${bgc2?.r},${bgc2?.g},${bgc2?.b},${bgc2?.a}));`;
        break;
      }
    }
  } else {
    style += `background: none;`;
  }

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

  if (buttonProperties.hasTextShadow) {
    const tsc = buttonProperties.textShadowColor;
    style += `text-shadow: ${buttonProperties.textShadowDistanceX} ${buttonProperties.textShadowDistanceY} ${buttonProperties.textShadowBlur} rgba(${tsc?.r},${tsc?.g},${tsc?.b},${tsc?.a});`;
  }

  if (buttonProperties.hasBoxShadow) {
    const bsc = buttonProperties.boxShadowColor;
    const bsInset = buttonProperties.boxShadowInset ? " inset" : "";
    style += `box-shadow: ${buttonProperties.boxShadowDistanceX} ${buttonProperties.boxShadowDistanceY} ${buttonProperties.boxShadowBlur} ${buttonProperties.boxShadowSpread} rgba(${bsc?.r},${bsc?.g},${bsc?.b},${bsc?.a})${bsInset};`;
  }

  style += "position: absolute;";
  style += "white-space: nowrap;";
  style += `transition-duration: ${buttonProperties.hoverTransitionDuration}ms;`;

  // HOVER START >>>>
  let cssHoverStyle = "";

  if (buttonProperties.hasHoverBorder) {
    cssHoverStyle = addBorderBox(
      cssHoverStyle,
      buttonProperties.hoverBorderSize
    );

    cssHoverStyle += `border-style: ${buttonProperties.hoverBorderStyle};`;
    const bhc = buttonProperties.hoverBorderColor;
    cssHoverStyle += `border-color: rgba(${bhc?.r},${bhc?.g},${bhc?.b},${bhc?.a});`;
    cssHoverStyle = addBorderRadius(
      cssHoverStyle,
      buttonProperties.hoverBorderRadius
    );
  } else {
    //cssHoverStyle += "border-style: none;";
  }

  if (buttonProperties.hasHoverBackground) {
    switch (buttonProperties.hoverBackgroundType) {
      case "solid": {
        const hbgc = buttonProperties.hoverBackgroundColor;
        cssHoverStyle += `background-color: rgba(${hbgc?.r},${hbgc?.g},${hbgc?.b},${hbgc?.a});`;
        break;
      }
      case "gradient": {
        const hbgc1 = buttonProperties.hoverBackgroundGradientColor1;
        const hbgc2 = buttonProperties.hoverBackgroundGradientColor2;
        cssHoverStyle += `background-image: linear-gradient(rgba(${hbgc1?.r},${hbgc1?.g},${hbgc1?.b},${hbgc1?.a}), rgba(${hbgc2?.r},${hbgc2?.g},${hbgc2?.b},${hbgc2?.a}));`;
        break;
      }
    }
  } else {
    //cssHoverStyle += `background: none;`;
  }

  const css = `<style>
  .object-content-${object.id}:hover {
    ${cssHoverStyle.replaceAll(";", " !important;")}
  }
  </style>`;

  // HOVER END <<<
  return `${css}<button class="object-content object-content-${
    object.id
  }" style="${style}">${nl2br(buttonProperties.text)}</button>`;
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

function getMultiImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const multiImageProperties = object.definition.values as MultiImageValues;
  //const url = multiImageProperties.urls[0];

  if (multiImageProperties.urls.length === 0) {
    return `<div style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">MULTI IMAGE<br/>PLACEHOLDER</div>`;
  }

  const coverPlacementValue = multiImageProperties.fit as ICoverPlacementValue;

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
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  let ret = "";
  ret += `<div class="object-content" style="width: 100%; height: 100%;">`;
  multiImageProperties.urls.forEach((url: IImageInputValue, idx: number) => {
    let styleOne = style;
    styleOne += `background-image:url('${url.url}');`;
    styleOne += `position: absolute;`;
    if (isPlayer) {
    } else {
      styleOne += `top: -${idx * 20}px;`;
      styleOne += `left: ${idx * 20}px;`;
      styleOne += `z-index: ${100 - idx};`;
    }
    ret += `<div class="object-content" style="${styleOne}"></div>`;
  });
  ret += `</div>`;
  return ret;
}

export function getImageThumbnailHtml(object: IObject) {
  const imageProperties = object.definition.values as ImageValues;

  if (imageProperties.url.isPlaceholder) {
    return `<div></div>`;
  }

  let style = "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${imageProperties.url.url}');`;
  style += `background-repeat:no-repeat;`;
  //style += `background-size: cover;`;
  style += `background-position: center center;`;

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
  const svgValues = object.definition.values as SvgValues;

  const svgWidth = 24;
  const svgHeight = 24;

  const w = parseInt(calculatedObjectSize.width as string);
  const h = parseInt(calculatedObjectSize.height as string);

  let scaleX = 1;
  let scaleY = 1;
  scaleY = h / w;

  const css = `
  <style>
  .object-content-${object.id}{
    transform: scaleX(${scaleX}) scaleY(${scaleY});
    transform-origin: top left;
  }
  .object-content-${object.id} svg {
    fill: ${color2rgba(svgValues.fill)};
    stroke: ${color2rgba(svgValues.stroke)};
    width: 100%;
    height: 100%;
  }
  </style>`;

  //if (svgValues.svg) {
  return `${css}<div class="object-content object-content-${object.id}">${svgValues.svg.source}</div>`;
  //}
  //return ``;
}

function replaceColors(svgSource: string, colors: RGBColor[]) {
  let idx = 0;
  /*
  let s;
  s = svgSource.replace(/fill:(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return "fill:" + color2rgba(retColor);
  });
  s = s.replace(/fill="(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return `fill="` + color2rgba(retColor);
  });

  return s;*/

  return svgSource.replace(/(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return color2rgba(retColor);
  });
}

function getArrowHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const svgValues = object.definition.values as ArrowValues;
  const svgValuesMetadata = object.definition.valuesMetadata;

  const svgCode =
    svgValues.svg.colors && svgValues.hasCustomColors
      ? replaceColors(svgValues.svg.source, svgValues.svg.colors)
      : svgValues.svg.source;

  const svgWidth = 24;
  const svgHeight = 24;

  const w = parseInt(calculatedObjectSize.width as string);
  const h = parseInt(calculatedObjectSize.height as string);

  let scaleX = 1;
  let scaleY = 1;
  scaleY = svgValues.keepAspectRatio ? 1 : h / w;

  const fill =
    !svgValuesMetadata["fill"].disabled && svgValues.hasStrokeFill
      ? `fill: ${color2rgba(svgValues.fill)};
    `
      : "";
  const stroke =
    !svgValuesMetadata["stroke"].disabled && svgValues.hasStrokeFill
      ? `stroke: ${color2rgba(svgValues.stroke)};
    `
      : "";

  // hover START>>
  const hoverFill =
    !svgValuesMetadata["hoverFill"].disabled && svgValues.hasHover
      ? `fill: ${color2rgba(svgValues.hoverFill)};
   `
      : "";
  const hoverStroke =
    !svgValuesMetadata["hoverStroke"].disabled && svgValues.hasHover
      ? `stroke: ${color2rgba(svgValues.hoverStroke)};
   `
      : "";
  // hover END <<
  const css = `
  <style>
  .object-content-${object.id}{
    transform: scaleX(${scaleX}) scaleY(${scaleY});
    transform-origin: top left;
    ${svgValues.keepAspectRatio ? "width:100%;height:100%;" : ""}
   
  }
  .object-content-${object.id} svg {
    ${fill}
    ${stroke}
    width: 100%; 
    height: 100%;
    transition-duration: ${svgValues.hoverTransitionDuration}ms;
  }
  .object-content-${object.id}:hover svg {
    ${hoverFill}
    ${hoverStroke}
  }
  </style>`;

  //if (svgValues.svg) {
  return `${css}<div class="object-content object-content-${object.id}">${svgCode}</div>`;
  //}
  //return ``;
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

export function color2rgba(c: RGBColor): string {
  return `rgba(${c?.r},${c?.g},${c?.b},${c?.a})`;
}
