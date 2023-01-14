import {
  cloneDeep,
  flatten,
  forEach,
  forOwn,
  mapValues,
  pick,
} from "lodash-es";
import React from "react";
import { RGBColor } from "react-color";
import {
  CanvasValues,
  IBoxValue,
  ICoverPlacementValue,
  SourceImageValues,
} from "webslider-sdk/lib/inputs/i-inputs";
import { ImageValues } from "../objects/image/image";
import {
  getAppObjectDefinition,
  getPlayerObjectDefinition,
} from "webslider-sdk/lib/objects/objects-register";
import {
  IAnimation,
  ILayout,
  IObject,
  ITransition,
  LayoutTypes,
  ObjectType,
} from "webslider-sdk/lib/objects/i-object";
import {
  calculateObjectSize,
  calculateObjectSizePerDevice,
} from "../panels/stage-panel/StagePanelUtils";
import { ILayer, ILayers, ILayerValues } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { ISlide, ISlides, SlideType } from "../store/reducers/i-slides";
import { ISettings } from "../store/reducers/i-settings";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IPreviewScope } from "../store/reducers/stage";
import {
  getRealSlideDuration,
  getRealExitSlideDuration,
  convertTimeUnitToMs,
} from "../utils/utils";
import {
  IPlayerData,
  ISlideData,
  ISources,
  IItemsData,
  ItemVisibility,
} from "./i-export-html";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { getAppAnimationDefinition } from "webslider-sdk/lib/animations/animations-register";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";
import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";

export function generatePlayerData(
  sources: ISources,
  scope: IPreviewScope | null,
  breakpointConfig: BreakpointConfiguration,
  breakpoints: Breakpoints,
  settings: ISettings,
  extensions: IExtensionItem[] = [],
  options: { isSave: boolean; isForThumbnail?: boolean }
): IPlayerData {
  const { slides, layers, objects } = sources;

  let extensionTypes: string[] = [];

  let itemsVisibility: ItemVisibility[] = [];

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
      backSlidesArr = getBackSlideArr(slides);
      break;
    }
  }

  // generate thumbnails
  // const thumbnailHtmlArr = getThumbnailHtmlArr(
  //   normalSlidesArr,
  //   layers,
  //   objects
  // );

  const slideDataArr: ISlideData[] = [];
  const frontSlideDataArr: ISlideData[] = [];
  const backSlideDataArr: ISlideData[] = [];

  let html = "<div class='sliderRoot'>"; // sliderRoot
  html += "<div class='sliderBackground'></div>";
  html += "<div class='slidesHolder'>"; // slides holder open

  normalSlidesArr.forEach((slide) => {
    const slideDataRes = generateSlideData(
      slide,
      layers,
      objects,
      breakpointConfig,
      breakpoints,
      settings,
      // thumbnailHtmlArr,
      // normalSlidesArr.length,
      { isSave: options.isSave, isForThumbnail: options.isForThumbnail }
    );
    slideDataArr.push(slideDataRes.slideData);
    html += slideDataRes.html;
    extensionTypes = [...extensionTypes, ...slideDataRes.extensionTypes];
    itemsVisibility = [...itemsVisibility, ...slideDataRes.itemsVisibility];
  });

  frontSlidesArr.forEach((slide) => {
    const slideDataRes = generateSlideData(
      slide,
      layers,
      objects,
      breakpointConfig,
      breakpoints,
      settings,
      // thumbnailHtmlArr,
      // normalSlidesArr.length,
      { isSave: options.isSave }
    );
    frontSlideDataArr.push(slideDataRes.slideData);
    html += slideDataRes.html;
    extensionTypes = [...extensionTypes, ...slideDataRes.extensionTypes];
    itemsVisibility = [...itemsVisibility, ...slideDataRes.itemsVisibility];
  });

  backSlidesArr.forEach((slide) => {
    const slideDataRes = generateSlideData(
      slide,
      layers,
      objects,
      breakpointConfig,
      breakpoints,
      settings,
      // thumbnailHtmlArr,
      // normalSlidesArr.length,
      { isSave: options.isSave }
    );
    backSlideDataArr.push(slideDataRes.slideData);
    html += slideDataRes.html;
    extensionTypes = [...extensionTypes, ...slideDataRes.extensionTypes];
    itemsVisibility = [...itemsVisibility, ...slideDataRes.itemsVisibility];
  });

  html += "</div>"; //slides holder close
  html += "</div>"; //slider root close

  const playerExtensions = extensions
    .filter((item) => extensionTypes.indexOf(item.type) !== -1)
    .map((extension) =>
      pick(extension, "name", "type", "componentType", "packageFiles")
    );

  return {
    html,
    slides: slideDataArr,
    frontSlides: frontSlideDataArr,
    backSlides: backSlideDataArr,
    itemsVisibility,
    config: {
      skipFirstSlideAnimation: settings.skipFirstSlideAnimation,
      breakpointReference: settings.breakpointReference,
      sliderBackgroundColor: settings.sliderBackgroundColor,
      autoPlay: settings.autoPlay,
    },
    breakpointData: {
      width: breakpointConfig.normal.maxSliderSize.width,
      height: breakpointConfig.normal.maxSliderSize.height,
      pageWidth: breakpointConfig.normal.page.width,
      pageHeight: breakpointConfig.normal.page.height,
    },
    breakpoints: {
      breakpointsConfiguration: cloneDeep(
        breakpoints
      ).breakpointsConfiguration.filter((bc) => bc.enabled),
    },
    extensions: playerExtensions as any, //IExtensionItemForPlayer
  };
}

function pickLayoutFromLayouts(
  layout: LayoutTypes,
  layer: ILayout
): Partial<
  Pick<
    ILayout,
    "absoluteLayout" | "fitLayout" | "gridLayout" | "snapLayout" | "insetLayout"
  >
> {
  switch (layout) {
    case "absolute": {
      return { absoluteLayout: layer.absoluteLayout };
    }
    case "grid": {
      return { gridLayout: layer.gridLayout };
    }
    case "fit": {
      return { fitLayout: layer.fitLayout };
    }
    case "snap": {
      return { snapLayout: layer.snapLayout };
    }
    case "inset": {
      return { insetLayout: layer.insetLayout };
    }
    // case "anchor": {
    //   return { snapLayout: layer.snapLayout };
    // }
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
  // thumbnailHtmlArr: (string | undefined)[],
  // slidesLength: number,
  options: { isSave: boolean; isForThumbnail?: boolean }
): {
  slideData: ISlideData;
  html: string;
  extensionTypes: string[];
  itemsVisibility: ItemVisibility[];
} {
  let html: string = "";
  const extensionTypes: string[] = [];
  const itemsVisibility: ItemVisibility[] = [];

  const itemsData: IItemsData[] = [];
  const someSlideData: Partial<ISlideData["slide"]> = pick(slide, [
    "id",
    "slideType",
    "transitionEnabled",
    "transitions",
    "duration",
    "exitDuration",
    "moveToTop",
    "customId",
    "title",
    "description",
  ]);

  someSlideData.transitionOverlapTime = convertTimeUnitToMs(
    slide.transitionOverlapTime
  );
  someSlideData.transitionDurationTime = convertTimeUnitToMs(
    slide.transitionDurationTime
  );
  someSlideData.duration!.customValue = getRealSlideDuration(slide, settings);
  someSlideData.exitDuration!.customValue = getRealExitSlideDuration(
    slide,
    settings
  );
  someSlideData.moveToTop = slide.moveToTop;

  // slide data
  const slideData: ISlideData = {
    slide: someSlideData as ISlideData["slide"],
    items: itemsData,
  };

  forOwn(someSlideData.transitions, (tArr: ITransition[] | any) => {
    tArr.forEach((t: ITransition | any) => {
      const def = getAppAnimationDefinition(t?.animation?.id);
      if (def?.external) {
        extensionTypes.push(t.animation.id);
      }
    });
  });

  let slideStyle = "";
  slideStyle += "position: absolute;";
  //slideStyle += `width: ${breakpointConfig.normal.maxSliderSize.width}px;`;
  //slideStyle += `height: ${breakpointConfig.normal.maxSliderSize.height}px;`;
  if (slide.slideType === SlideType.Front) slideStyle += `z-index:1000;`;
  if (slide.slideType === SlideType.Back) slideStyle += `z-index:-1000;`;

  // prettier-ignore
  html += `  <div style='${slideStyle}' class='slide slide-${slide.id} ${getCustomIdClass(slide)}'>`; // slide open

  const layerArr: ILayer[] = getLayerArr(layers, slide.layerIds);
  layerArr.forEach((layer) => {
    let hideForThumbnail = false;
    const visibleForAllDevices = layer.responsiveVisibility.showAll;
    if (!visibleForAllDevices) {
      itemsVisibility.push({
        itemType: "layer",
        id: layer.id,
        displayOn: layer.responsiveVisibility.displayOn,
      });

      hideForThumbnail =
        layer.responsiveVisibility.displayOn.indexOf(breakpointConfig.type) ===
        -1;
    }

    // TODO; we have similar code for layer
    const layerEffectWrappers: string[] = [];
    forOwn(layer.transitions, (tArr: ITransition[] | any) => {
      tArr.forEach((t: ITransition) => {
        const def = getAppAnimationDefinition(t?.animation?.id);
        if (def) {
          const requireWrapperElement = (def.formDefaults as IAnimationBase)
            .requireWrapperElement;
          if (requireWrapperElement) {
            const animationWrapperClassName = `animation-wrapper-${def?.animationId}-${layer.id}`;
            layerEffectWrappers.push(animationWrapperClassName);
          }
          if (def?.external) {
            extensionTypes.push(t.animation.id);
          }
        }
      });
    });

    const layerValues = layer.definition.values as ILayerValues;

    const layerClassName = "layer-" + layer.id;
    itemsData.push({
      itemId: layer.id,
      customId: layer.customId,
      itemType: "layer",
      itemValues: layer.definition.values,
      objectClass: layerClassName,
      transitions: layer.transitions,
      data: {
        slideDuration: slide.duration,
        exitSlideDuration: slide.exitDuration,
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

    // NOTE exception for perspective
    if (layer.transformDefinition?.values?.hasPerspective) {
      layerStyle += `perspective: ${layer.transformDefinition?.values?.transformPerspective};`;
    }

    const calculatedLayerSize = calculateObjectSize(layer, breakpointConfig, {
      resetPosition: false,
    });
    forOwn(calculatedLayerSize, function (value, key) {
      layerStyle += key + ":" + value + ";";
    });

    if (layerValues.layoutChildren.itemsGap.type === "common") {
      const t = layerValues.layoutChildren.type;
      html += `<style>
      .${layerClassName} > * {
        ${t === "column" ? "margin-bottom" : "margin-right"}: ${
        layerValues.layoutChildren.itemsGap.commonValue
      };
      }
    </style>`;
    } else {
      const t = layerValues.layoutChildren.type;
      html += `<style>`;
      layerValues.layoutChildren.itemsGap.eachValues.forEach(
        (eachValue, idx) => {
          html += `.${layerClassName} > *:nth-child(${idx + 1}) {
            ${t === "column" ? "margin-bottom" : "margin-right"}: ${eachValue};
        }`;
        }
      );

      html += `</style>`;
    }

    const layerCustomIdClass = layer.customId
      ? `custom-id-${layer.customId}`
      : "";

    // NOTE: hide for other devices if exporting for thumbnail
    layerStyle +=
      options.isForThumbnail && hideForThumbnail ? "display:none;" : "";

    let layerWrapperStyle = layerStyle;
    layerStyle +=
      "position: relative; left:initial; top: initial; overflow: visible;";

    // layerStyle += "perspective: 150px";
    layerStyle = addCommonPropertiesToStyle(layerStyle, layer);
    layerStyle = addTransformPropertiesToStyle(layerStyle, layer);

    html += `    <div class="layer-wrapper layer-wrapper-${layer.id}" style='${layerWrapperStyle}'>`; // open layer wrapper

    html += layerEffectWrappers.map(
      (cn) =>
        `<div class="animation-wrapper ${cn}" style='position:absolute;width:100%;height:100%;'>` // IMPORTANT: Ovde ide transform-origin za animacije na lejeru
    );

    html += `    <div class="layer ${layerClassName} ${getCustomIdClass(
      layer
    )}" style="${layerStyle}">`; // layer open

    const objectArr = getObjectArr(objects, layer.objectIds);
    objectArr.forEach((object) => {
      if (!visibleForAllDevices) {
        itemsVisibility.push({
          itemType: "object",
          id: object.id,
          displayOn: layer.responsiveVisibility.displayOn,
        });
      }

      //part for externals
      const objDeff = getAppObjectDefinition(object.type);
      if (objDeff?.external) {
        extensionTypes.push(object.type);
      }

      // TODO; we have similar code for layer
      const effectWrappers: string[] = [];
      forOwn(object.transitions, (tArr: ITransition[] | any) => {
        tArr.forEach((t: ITransition) => {
          const def = getAppAnimationDefinition(t?.animation?.id);
          if (def) {
            const requireWrapperElement = (def.formDefaults as IAnimationBase)
              .requireWrapperElement;
            if (requireWrapperElement) {
              const animationWrapperClassName = `animation-wrapper-${def?.animationId}-${object.id}`;
              effectWrappers.push(animationWrapperClassName);
            }
            if (def?.external) {
              extensionTypes.push(t.animation.id);
            }
          }
        });
      });

      // << part for externlas
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

      let wrapperStyle = style;
      wrapperStyle += "pointer-events: none;";

      style +=
        "position: relative; left:initial; top: initial; overflow: visible; pointer-events:all;";

      // NOTE exception for perspective
      if (object.transformDefinition?.values?.hasPerspective) {
        style += `perspective: ${object.transformDefinition?.values?.transformPerspective};`;
        wrapperStyle += `perspective: ${object.transformDefinition?.values?.transformPerspective};`;

        // TODO: this should be configurable? maybe?
        style += `transform-origin: center center;`;
        wrapperStyle += `transform-origin: center center;`;
      }

      // TODO: check this
      //wrapperStyle += `overflow: hidden;`;

      html += `      <div class="object-wrapper object-wrapper-${object.id}" style='${wrapperStyle}'>`; // open object wrapper
      html += effectWrappers.map(
        (cn) =>
          `<div class="animation-wrapper ${cn}" style='position:absolute;width:100%;height:100%;'>`
      );
      html += `      <div class="object ${objectClass} ${getCustomIdClass(
        object
      )}" style='${style}'>`; // open object

      const objectHtml = getObjectHtml(
        object,
        calculatedObjectSize,
        true,
        options.isSave
        // thumbnailHtmlArr, // for bullets
        // slidesLength // for bullets
      );

      itemsData.push({
        itemId: object.id,
        customId: object.customId,
        itemType: object.type,
        itemValues: object.definition.values,
        itemSystemType: getAppObjectDefinition(object.type)?.meta?.coreType,
        calculatedObjectSize,
        calculatedObjectSizePerDevice,
        objectClass: objectClass,
        transitions: object.transitions,
        events: getObjectEvents(object),
        data: {
          slideDuration: slide.duration,
          exitSlideDuration: slide.exitDuration,
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
      html += effectWrappers.map((cn) => `</div>`); // object-effect close
      html += "      </div>"; // object close wrapper
    });

    html += layerEffectWrappers.map((cn) => `</div>`); // animation-wrapper close
    html += "    </div>"; // layer close
    html += "    </div>"; // layer wrapper close
  });

  html += "  </div>"; // slide close

  return {
    slideData,
    html,
    extensionTypes,
    itemsVisibility,
  };
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
  isSave: boolean
  // thumbnailHtmlArr: (string | undefined)[],
  // slidesCounter = 3
) {
  switch (object.type) {
    //case ObjectType.YOUTUBE_VIDEO:
    //return getYoutubeVideoHtml(object, calculatedObjectSize, isPlayer);
    case ObjectType.CANVAS:
      return getCanvasHtml(object, calculatedObjectSize, isPlayer);
    case ObjectType.SOURCE_IMAGE:
      return getSourceImageHtml(object, calculatedObjectSize, isPlayer);
    default:
      const objDeff = isPlayer
        ? getPlayerObjectDefinition(object.type)
        : getAppObjectDefinition(object.type);
      //logger.app.trace(isPlayer);
      //logger.app.trace(object.type);
      //logger.app.log(objDeff);
      if (objDeff && objDeff.getHtml) {
        //try {
        return objDeff.getHtml({
          object,
          calculatedObjectSize,
          isPlayer,
          isSave,
          // thumbnailHtmlArr,
          // slidesCounter,
        });
      }
      return "";
  }
}

// OBJECT HTML CREATOR FUNCTIONS **********************

// export function getImageThumbnailHtml(object: IObject) {
//   const imageValues = object.definition.values as ImageValues;

//   if (!imageValues.image.image.sourceType) {
//     return `<div></div>`;
//   }

//   let style = "width: 100%;";
//   style += "height: 100%;";
//   style += `background-image:url('${imageValues.image.image.src}');`; // TODO: IMPORTANT!!! Add promise
//   style += `background-repeat:no-repeat;`;
//   //style += `background-size: cover;`;
//   style += `background-position: center center;`;

//   return `<div class="object-content" style="${style}"></div>`;
// }

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
  if (backgroundSize === "fill") backgroundSize = "100% 100%";
  const aH = (imageProperties.placement.value as ICoverPlacementValue)
    .positionHorizontal;
  const aV = (imageProperties.placement.value as ICoverPlacementValue)
    .positionVertical;

  let style = "";
  style = addCommonPropertiesToStyle(style, object);
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
  style = addCommonPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${imageProperties.url.value.url}');`;
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  return `<div class="object-content" style="${style}"></div>`;
}*/

// TODO: should we remove this?
function getSourceImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const imageValues = object.definition.values as SourceImageValues;

  if (!imageValues.url.image.sourceType) {
    return `<div class="object-content" style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">IMAGE<br/>PLACEHOLDER</div>`;
  }

  let backgroundSize = (imageValues.placement as ICoverPlacementValue).size as
    | "cover"
    | "fill"
    | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fill") backgroundSize = "100% 100%";
  const aH = (imageValues.placement as ICoverPlacementValue).positionHorizontal;
  const aV = (imageValues.placement as ICoverPlacementValue).positionVertical;

  let style = "";
  style = addCommonPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${imageValues.url.image.src}');`; //TODO: Important
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;
  style += `opacity: ${imageValues.visible ? 1 : 0};`;

  return `<div class="object-content" style="${style}"><img style="opacity:0;" id="${imageValues.id}" src="${imageValues.url.image.src}"></div>`; // TODO: important
}

export function replaceColors(svgSource: string, colors: RGBColor[]) {
  let idx = 0;
  /*
  let s;
  s = svgSource.replace(/fill:(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return "fill:" + convertRGBColor2RGBAString(retColor);
  });
  s = s.replace(/fill="(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return `fill="` + convertRGBColor2RGBAString(retColor);
  });

  return s;*/

  return svgSource.replace(/(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return convertRGBColor2RGBAString(retColor);
  });
}

function getCanvasHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const canvasProperties = object.definition.values as CanvasValues;

  let style = "";
  style = addCommonPropertiesToStyle(style, object);
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

// TODO: fix type
export function getAllAssetsUrls(objects: IObjects): any {
  return flatten(
    objects.allObjects.map((objectId) => {
      const object = objects.objectById[objectId];
      const deff = getAppObjectDefinition(object.type);

      const transitionTypes = Object.keys(object.transitions);
      const arr = flatten(
        transitionTypes.map((transType: string) => {
          return flatten(
            (object.transitions as any)[transType].map((anim: ITransition) => {
              const def = getAppAnimationDefinition(anim.animation.id);
              return def?.getAssetsUrls?.({
                values: anim.animation.values as { [key: string]: any },
              });
            })
          );
        })
      );

      return [
        ...arr.filter((item) => !!item), //TODO: check why we are getting undefined
        ...(deff?.getAssetsUrls?.({ values: object.definition.values }) || []),
      ];
    })
  );
}

function getCustomIdClass(props: { customId: string }) {
  return props.customId ? `custom-id-${props.customId}` : "";
}
