import {
  cloneDeep,
  flatten,
  forOwn,
  mapValues,
  pick,
  uniq,
  uniqWith,
} from "lodash-es";
import React from "react";
import { RGBColor } from "react-color";
import {
  CanvasValues,
  IBoxValue,
  ICoverPlacementValue,
  SourceImageValues,
} from "../inputs/types";
import { ImageValues } from "../objects/image/image";
import { getObjectPlaceholder } from "../objects/object-helpers";
import { getObjectDefinition } from "../objects/objects-factory";
import { ILayout, IObject, LayoutTypes, ObjectType } from "../objects/types";
import {
  calculateObjectSize,
  calculateObjectSizePerDevice,
} from "../panels/stage-panel/StagePanelUtils";
import { ILayer, ILayers, ILayerValues } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { ISlide, ISlides, SlideType } from "../store/reducers/i-slides";
import {
  BreakpointConfiguration,
  Breakpoints,
  ISettings,
} from "../store/reducers/i-settings";
import { IPreviewScope } from "../store/reducers/stage";
import { nl2br } from "../utils/doom-utils/common";
import {
  rgbColor2cssRgba,
  getRealSlideDuration,
  addBorderRadius,
  addCommonPropertiesToStyle,
} from "../utils/utils";
import { getThumbnailHtmlArr } from "./export-html-utils";
import {
  IPlayerData,
  ISlideData,
  ISources,
  ITransitionsData,
} from "./i-export-html";
import { IMarketItem } from "../objects/i-marketplace";

export function generatePlayerData(
  sources: ISources,
  scope: IPreviewScope | null,
  breakpointConfig: BreakpointConfiguration,
  breakpoints: Breakpoints,
  settings: ISettings,
  marketItems: IMarketItem[] = []
): IPlayerData {
  const { slides, layers, objects } = sources;
  //const slideIds: string[] = [];

  let marketItemTypes: string[] = [];

  let normalSlidesArr: ISlide[] = [];
  let frontSlidesArr: ISlide[] = [];
  let backSlidesArr: ISlide[] = [];

  switch (scope?.entityType) {
    case "slide": {
      normalSlidesArr = getNormalSlideArr(slides).filter(
        (slide) => slide.id === scope?.entityId
      );

      break;
    }
    default: {
      normalSlidesArr = getNormalSlideArr(slides);
      frontSlidesArr = getFrontSlideArr(slides);
      backSlidesArr = getFrontSlideArr(slides);
      break;
    }
  }

  // generate thumbnails
  const thumbnailHtmlArr = getThumbnailHtmlArr(
    normalSlidesArr,
    layers,
    objects
  );

  const slideDataArr: ISlideData[] = [];
  const frontSlideDataArr: ISlideData[] = [];
  const backSlideDataArr: ISlideData[] = [];

  let html = "<div class='slidesHolder'>"; // slides holder open

  normalSlidesArr.forEach((slide) => {
    const slideDataRes = generateSlideData(
      slide,
      layers,
      objects,
      breakpointConfig,
      breakpoints,
      settings,
      thumbnailHtmlArr,
      normalSlidesArr.length
    );
    slideDataArr.push(slideDataRes.slideData);
    html += slideDataRes.html;
    marketItemTypes = [...marketItemTypes, ...slideDataRes.marketItemTypes];
  });

  frontSlidesArr.forEach((slide) => {
    const slideDataRes = generateSlideData(
      slide,
      layers,
      objects,
      breakpointConfig,
      breakpoints,
      settings,
      thumbnailHtmlArr,
      normalSlidesArr.length
    );
    frontSlideDataArr.push(slideDataRes.slideData);
    html += slideDataRes.html;
    marketItemTypes = [...marketItemTypes, ...slideDataRes.marketItemTypes];
  });
  html += "</div>"; //slides holder close

  return {
    html,
    slideDataArr,
    frontSlideDataArr,
    breakpointData: {
      width: breakpointConfig.normal.maxSliderSize.width,
      height: breakpointConfig.normal.maxSliderSize.height,
      pageWidth: breakpointConfig.normal.page.width,
      pageHeight: breakpointConfig.normal.page.height,
    },
    breakpoints: cloneDeep(breakpoints),
    marketItems: marketItems.filter(
      (item) => marketItemTypes.indexOf(item.type) !== -1
    ),
  };
}

function pickLayoutFromLayouts(
  layout: LayoutTypes,
  layer: ILayout
): Partial<
  Pick<ILayout, "absoluteLayout" | "fitLayout" | "gridLayouts" | "snapLayout">
> {
  switch (layout) {
    case "absolute": {
      return { absoluteLayout: layer.absoluteLayout };
    }
    case "grid": {
      return { gridLayouts: layer.gridLayouts };
    }
    case "fit_guidelines":
    case "fit_page":
    case "fit_stage": {
      return { fitLayout: layer.fitLayout };
    }
    case "snap": {
      return { snapLayout: layer.snapLayout };
    }
    case "none": {
      return {};
    }
  }
}
function generateSlideData(
  slide: ISlide,
  layers: ILayers,
  objects: IObjects,
  breakpointConfig: BreakpointConfiguration,
  breakpoints: Breakpoints,
  settings: ISettings,
  thumbnailHtmlArr: (string | undefined)[],
  slidesLength: number
): { slideData: ISlideData; html: string; marketItemTypes: string[] } {
  let html: string = "";
  const marketItemTypes: string[] = [];

  const transitionsData: ITransitionsData[] = [];
  const someSlideData = pick(slide, [
    "id",
    "slideType",
    "transitions",
    "duration",
    "customId",
  ]);
  someSlideData.duration.customValue = getRealSlideDuration(slide, settings);
  // slide data
  const slideData: ISlideData = {
    slide: someSlideData,
    transitionsData,
  };

  let slideStyle = "";
  slideStyle += "position: absolute;";
  slideStyle += `width: ${breakpointConfig.normal.maxSliderSize.width}px;`;
  slideStyle += `height: ${breakpointConfig.normal.maxSliderSize.height}px;`;
  if (slide.slideType === SlideType.Front) slideStyle += `z-index:1000;`;

  html +=
    "  <div style='" + slideStyle + "' class='slide slide-" + slide.id + "'>"; // slide open
  //slideIds.push(slide.id);

  const layerArr: ILayer[] = getLayerArr(layers, slide.layerIds);
  layerArr.forEach((layer) => {
    const layerValues = layer.definition.values as ILayerValues;

    const layerClassName = "layer-" + layer.id;
    transitionsData.push({
      itemId: layer.id,
      itemType: "layer",
      itemValues: layer.definition.values,
      objectClass: layerClassName,
      transitions: layer.transitions,
      data: {
        slideDuration: slide.duration,
        objectWidth: 1000,
        objectHeight: 500,
        objectLeft: 0,
        objectTop: 0,
        overflow: "",
        objectHtml: " ",
      },
      layout: {
        layout: layer.layout,
        selfSize: layer.selfSize,
        ...pickLayoutFromLayouts(layer.layout, layer),
      },
    });

    // TODO: IMPORTANT
    // IMPORTANT: !!!!!! SIZE HARDCODED
    //html += `    <div class="${layerClassName}" style="width:1000px; height: 500px">`; // layer open
    let layerStyle = `position:absolute;`;
    //layerStyle += `border: 1px solid red;`;
    layerStyle += `overflow: ${layerValues.overflow};`;
    layerStyle += `box-sizing: border-box;`;

    layerStyle += addCommonPropertiesToStyle(layerStyle, layer);

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

    if (layerValues.layoutChildren.itemsGap.type === "common") {
      html += `<style>
      .${layerClassName} > * {
        margin-bottom: ${layerValues.layoutChildren.itemsGap.commonValue};
      }
    </style>`;
    } else {
      html += `<style>`;
      layerValues.layoutChildren.itemsGap.eachValues.forEach(
        (eachValue, idx) => {
          html += `.${layerClassName} > *:nth-child(${idx + 1}) {
          margin-bottom: ${eachValue};
        }`;
        }
      );

      html += `</style>`;
    }

    console.log(layerStyle);
    html += `    <div class="layer ${layerClassName}" style="${layerStyle}">`; // layer open

    const objectArr = getObjectArr(objects, layer.objectIds);
    objectArr.forEach((object) => {
      const objDeff = getObjectDefinition(object.type);
      if (objDeff?.external) {
        marketItemTypes.push(object.type);
      }

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

      const calculatedObjectSizePerDevice = calculateObjectSizePerDevice(
        object,
        breakpoints
      );

      let style = "";
      forOwn(calculatedObjectSize, function (value, key) {
        style += key + ":" + value + ";";
      });
      style += layerValues.hasLayoutChildren
        ? "position: static;"
        : object.layout === "absolute"
        ? "position: absolute;"
        : "position: absolute;"; //"position: relative;";
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
        thumbnailHtmlArr, // for bullets
        slidesLength // for bullets
      );
      //console.log(getObjectDefinition(object.type)?.meta?.coreType);
      // alert(getObjectDefinition(object.type)?.meta?.coreType);
      transitionsData.push({
        itemId: object.id,
        itemType: object.type,
        itemValues: object.definition.values,
        itemSystemType: getObjectDefinition(object.type)?.meta?.coreType,
        calculatedObjectSize,
        calculatedObjectSizePerDevice,
        objectClass: objectClass,
        transitions: object.transitions,
        events: getObjectEvents(object),
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
        layout: {
          layout: object.layout,
          selfSize: object.selfSize,
          ...pickLayoutFromLayouts(object.layout, object),
        },
      });
      html += objectHtml;

      html += "      </div>"; // object close
      html += "      </div>"; // object close wrapper
    });

    html += "    </div>"; // layer close
  });

  html += "  </div>"; // slide close

  return { slideData, html, marketItemTypes };
}

function getObjectEvents(object: IObject) {
  const navValues = object.navigationDefinition.values;
  return navValues;
}

/**
 * Returns array of slides from store>slides
 */
export function getNormalSlideArr(slides: ISlides): ISlide[] {
  return slides.normalSlides.map((slideId) => slides.slideById[slideId]);
}

/**
 * Returns array of front slides from store>slides
 */
export function getFrontSlideArr(slides: ISlides): ISlide[] {
  return slides.frontSlides.map((slideId) => slides.slideById[slideId]);
}

/**
 * Returns array of front slides from store>slides
 */
export function getBackSlideArr(slides: ISlides): ISlide[] {
  return slides.backSlides.map((slideId) => slides.slideById[slideId]);
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
    //case ObjectType.YOUTUBE_VIDEO:
    //return getYoutubeVideoHtml(object, calculatedObjectSize, isPlayer);
    case ObjectType.CANVAS:
      return getCanvasHtml(object, calculatedObjectSize, isPlayer);
    case ObjectType.SOURCE_IMAGE:
      return getSourceImageHtml(object, calculatedObjectSize, isPlayer);
    default:
      const objDeff = getObjectDefinition(object.type);
      if (objDeff && objDeff.getHtml) {
        return objDeff.getHtml(
          object,
          calculatedObjectSize,
          isPlayer,
          thumbnailHtmlArr,
          sliderCounter
        );
      }
      return "";
  }
}

// OBJECT HTML CREATOR FUNCTIONS **********************

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

export function replaceColors(svgSource: string, colors: RGBColor[]) {
  let idx = 0;
  /*
  let s;
  s = svgSource.replace(/fill:(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return "fill:" + rgbColor2cssRgba(retColor);
  });
  s = s.replace(/fill="(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return `fill="` + rgbColor2cssRgba(retColor);
  });

  return s;*/

  return svgSource.replace(/(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return rgbColor2cssRgba(retColor);
  });
}

function getCanvasHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const canvasProperties = object.definition.values as CanvasValues;

  let style = "";
  //console.log(object);
  style += addCommonPropertiesToStyle(style, object);
  style += "position: absolute;";
  if (!isPlayer) {
    style += "background-color: rgba(255,255,255,0.2);";
  }
  return `<canvas width="${object.width}" height="${object.height}" class="object-content" style="${style}"/>`;
}

// UTILS FUNCTIONS **************

export function addBorderBox(style: string, boxValue: IBoxValue) {
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

export function addPaddingBox(style: string, boxValue: IBoxValue) {
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

export function getAllAssetsUrls(objects: IObjects) {
  return flatten(
    objects.allObjects.map((objectId) => {
      const object = objects.objectById[objectId];
      const deff = getObjectDefinition(object.type);
      console.log(object);
      return deff?.getAssetsUrls?.({ values: object.definition.values }) || [];
    })
  );
}
