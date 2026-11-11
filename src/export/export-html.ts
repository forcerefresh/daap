import {
  cloneDeep,
  flatten,
  forOwn,
  pick,
  uniqBy,
} from "lodash-es";
import React from "react";
import { RGBColor } from "react-color";
import {
  IBoxValue,
  ICoverPlacementValue,
  SourceImageValues,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  getAppObjectDefinition,
  getPlayerObjectDefinition,
  ICalculatedObjectSize,
} from "webslider-sdk/lib/objects/objects-register";
import {
  IObject,
  ITransition,
} from "webslider-sdk/lib/objects/i-object";
import { calculateObjectSize } from "../panels/stage-panel/StagePanelUtils";
import { ILayer, ILayers, ILayerValues } from "../store/reducers/i-layers";
import { IObjects } from "../store/reducers/i-objects";
import { IPage, IPages, PageType } from "../store/reducers/i-pages";
import { ISettings } from "../store/reducers/i-settings";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IPreviewScope } from "../store/reducers/stage";
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
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";
import { generateObjectData } from "./export-html-object";

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

  let normalSlidesArr: IPage[] = [];
  let loadSlidesArr: IPage[] = [];
  let frontSlidesArr: IPage[] = [];
  let backSlidesArr: IPage[] = [];

  switch (scope?.entityType) {
    case "slide": {
      normalSlidesArr = getNormalSlideArr(slides).filter(
        (slide) => slide.id === scope?.entityId
      );

      break;
    }
    default: {
      normalSlidesArr = getNormalSlideArr(slides);
      loadSlidesArr = getLoadSlideArr(slides);
      frontSlidesArr = getFrontSlideArr(slides);
      backSlidesArr = getBackSlideArr(slides);
      break;
    }
  }

  const slideDataArr: ISlideData[] = [];
  const loadSlideDataArr: ISlideData[] = [];
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
      { isSave: options.isSave, isForThumbnail: options.isForThumbnail }
    );
    slideDataArr.push(slideDataRes.slideData);
    html += slideDataRes.html;
    extensionTypes = [...extensionTypes, ...slideDataRes.extensionTypes];
    itemsVisibility = [...itemsVisibility, ...slideDataRes.itemsVisibility];
  });

  loadSlidesArr.forEach((slide) => {
    const slideDataRes = generateSlideData(
      slide,
      layers,
      objects,
      breakpointConfig,
      breakpoints,
      settings,
      { isSave: options.isSave, isForThumbnail: options.isForThumbnail }
    );
    loadSlideDataArr.push(slideDataRes.slideData);
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
      { isSave: options.isSave, isForThumbnail: options.isForThumbnail }
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
      { isSave: options.isSave, isForThumbnail: options.isForThumbnail }
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
      pick(
        extension,
        "name",
        "type",
        "extensionType",
        "version",
        "packageFiles"
      )
    );

  return {
    html,
    slides: slideDataArr,
    loadSlides: loadSlideDataArr,
    frontSlides: frontSlideDataArr,
    backSlides: backSlideDataArr,
    itemsVisibility,
    config: {
      skipFirstSlideAnimation: settings.skipFirstSlideAnimation,
      breakpointReference: settings.breakpointReference,
      pageBackgroundColor: settings.pageBackgroundColor,
      autoPlay: settings.autoPlay,
      hideOutsideContent: settings.hideOutsideContent,
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

function generateSlideData(
  slide: IPage,
  layers: ILayers,
  objects: IObjects,
  breakpointConfig: BreakpointConfiguration,
  breakpoints: Breakpoints,
  _settings: ISettings,
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
    "duration",
    "exitDuration",
    "moveToTop",
    "customId",
    "title",
    "description",
  ]);

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
  if (slide.type === PageType.Front) slideStyle += `z-index:1000;`;
  if (slide.type === PageType.Back) slideStyle += `z-index:-1000;`;

  // prettier-ignore
  html += `  <div style='${slideStyle}' class='slide-wrapper slide-wrapper-${slide.id}'>`; // slide open
  // prettier-ignore
  html += `  <div style='${slideStyle}' class='slide slide-${slide.id} ${getCustomIdClass(slide)}'>`; // slide open

  const layerArr: ILayer[] = getLayerArr(layers, slide.layerIds);
  layerArr.forEach((layer) => {
    let hideForThumbnail = false;
    const layerTransformValues = getObjectValuesForDevice(
      layer.transform,
      breakpointConfig.type // TODO
    );

    const layerEffectWrappers: string[] = [];

    const layerValues = (layer.properties ?? {}) as ILayerValues;

    const layerClassName = "layer-" + layer.id;
    itemsData.push({
      itemId: layer.id,
      parentItemId: undefined,
      itemType: "layer",
      properties: layer.properties ?? {},
      style: layer.style ?? {},
      transform: layer.transform ?? {},
      objectClass: layerClassName,
      data: {
        objectWidth: 1000,
        objectHeight: 500,
        objectLeft: 0,
        objectTop: 0,
        overflow: "",
        objectHtml: " ",
      },
      layout: {
        selfSize: layer.selfSize,
      },
    });

    // TODO: IMPORTANT
    let layerStyle = `position:absolute;`;
    layerStyle += `box-sizing: border-box;`;

    if (layerValues.hasLayoutChildren) {
      const t = layerValues.layoutChildren.type;
      if (t === "row" || t === "column") {
        layerStyle += "display:flex;";
        layerStyle += `align-items: ${layerValues.layoutChildren.align};`;
        layerStyle += `justify-content: ${layerValues.layoutChildren.justify};`;
        layerStyle += `flex-wrap: ${layerValues.layoutChildren.wrap};`;

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
    if (layerTransformValues?.hasPerspective) {
      layerStyle += `perspective: ${layerTransformValues?.transformPerspective};`;
    }

    const calculatedLayerSize = calculateObjectSize(
      layer,
      undefined,
      breakpointConfig,
      {
        resetPosition: false,
      }
    );
    forOwn(calculatedLayerSize, function (value, key) {
      layerStyle += key + ":" + value + ";";
    });

    // NOTE: transparent corner
    html += `<style>
      .${layerClassName}::-webkit-scrollbar-corner { background:transparent; }
    </style>`;

    if (layerValues.hasLayoutChildren) {
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
    }

    // NOTE: hide for other devices if exporting for thumbnail
    layerStyle +=
      options.isForThumbnail && hideForThumbnail ? "display:none;" : "";

    let layerAnimWrapperStyle = "";
    // NOTE exception for perspective >>>
    if (layerTransformValues?.hasPerspective) {
      layerStyle += `perspective: ${layerTransformValues?.transformPerspective};`;
      layerAnimWrapperStyle += `perspective: ${layerTransformValues?.transformPerspective};`;
    }

    if (layerTransformValues?.transformOriginX) {
      layerStyle += `transform-origin: ${
        layerTransformValues?.transformOriginX ?? "left"
      }  ${layerTransformValues?.transformOriginY ?? "top"};`;

    }

    // TODO: check this for parallax e.g.
    layerStyle += "pointer-events: none;";

    let layerWrapperStyle = layerStyle;
    layerStyle +=
      "position: relative; left:initial; top: initial; overflow: visible;";

    html += `    <div class="layer-wrapper layer-wrapper-${layer.id}" style='${layerWrapperStyle}'>`; // open layer wrapper

    html += layerEffectWrappers
      .map(
        (cn) =>
          `<div class="animation-wrapper ${cn}" style='${layerAnimWrapperStyle}position:absolute;width:100%;height:100%;'>` // IMPORTANT: Ovde ide transform-origin za animacije na lejeru
      )
      .join("");

    html += `    <div class="layer ${layerClassName} ${getCustomIdClass(
      layer
    )}" style="${layerStyle}">`; // layer open

    const objectArr = getObjectArr(objects, layer.objectIds);
    objectArr.forEach((object) => {
      const objectData = generateObjectData(
        objects,
        object,
        itemsData,
        extensionTypes,
        layer,
        breakpointConfig,
        breakpoints,
        layerValues,
        layerTransformValues,
        options
      );

      html += objectData.html;
    });

    html += layerEffectWrappers.map((_cn) => `</div>`).join(""); // animation-wrapper close
    html += "    </div>"; // layer close
    html += "    </div>"; // layer wrapper close
  });

  html += "  </div>"; // slide close
  html += "  </div>"; // slide wrapper close

  return {
    slideData,
    html,
    extensionTypes,
    itemsVisibility,
  };
}

/**
 * Returns array of slides from store>slides
 */
export function getNormalSlideArr(pages: IPages): IPage[] {
  return pages.pages.map((pageId) => pages.pageById[pageId]);
}

/**
 * Returns array of load slides from store>slides
 */
export function getLoadSlideArr(pages: IPages): IPage[] {
  return pages.loadPages?.map((pageId) => pages.pageById[pageId]) ?? [];
}

/**
 * Returns array of front slides from store>slides
 */
export function getFrontSlideArr(pages: IPages): IPage[] {
  return pages.frontPages?.map((pageId) => pages.pageById[pageId]) ?? [];
}

/**
 * Returns array of front slides from store>slides
 */
export function getBackSlideArr(pages: IPages): IPage[] {
  return pages.backPages?.map((pageId) => pages.pageById[pageId]) ?? [];
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
  isSave: boolean,
  deviceType?: DeviceType,
  isForThumbnail?: boolean,
  targetObject?: IObject,
  targetCalculatedObjectSize?: ICalculatedObjectSize
) {
  switch (object.type) {
    case "canvas":
      return getCanvasHtml(object, calculatedObjectSize, isPlayer);
    case "source_image":
      return getSourceImageHtml(object, calculatedObjectSize, isPlayer);
    default:
      const objDeff = isPlayer
        ? getPlayerObjectDefinition(object.type, "latest" /*object.version*/)
        : getAppObjectDefinition(object.type, "latest" /*object.version*/);
      if (objDeff && objDeff.getHtml) {
        return objDeff.getHtml({
          object,
          calculatedObjectSize: calculatedObjectSize as unknown as ICalculatedObjectSize,
          isPlayer,
          isSave,
          deviceType,
          isForThumbnail,
          targetObject,
          targetCalculatedObjectSize,
        });
      }
      return "";
  }
}

// OBJECT HTML CREATOR FUNCTIONS **********************

// TODO: should we remove this?
function getSourceImageHtml(
  object: IObject,
  _calculatedObjectSize: React.CSSProperties,
  _isPlayer: boolean
) {
  const imageValues = object.properties as SourceImageValues;

  if (!imageValues.url.sourceType) {
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
  style += `background-image:url('${imageValues.url.url}');`; //TODO: Important
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;
  style += `opacity: ${imageValues.visible ? 1 : 0};`;

  return `<div class="object-content" style="${style}"><img style="opacity:0;" id="${imageValues.id}" src="${imageValues.url.url}"></div>`; // TODO: important
}

export function replaceColors(svgSource: string, colors: RGBColor[]) {
  let idx = 0;

  return svgSource.replace(/(#[abcdef0-9]{3,6})/gi, function (_v, _c: string) {
    const retColor = colors[idx];
    idx++;
    return convertRGBColor2RGBAString(retColor);
  });
}

function getCanvasHtml(
  object: IObject,
  _calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
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
      const deff = getAppObjectDefinition(object.type, object.version);

      return [
        ...(deff?.getAssetsUrls?.({ values: object.properties }) || []),
      ];
    })
  );
}

// TODO: fix type
export function getAllFonts(objects: IObjects): any {
  const fonts = flatten(
    objects.allObjects.map((objectId) => {
      const object = objects.objectById[objectId];
      const deff = getAppObjectDefinition(object.type, object.version);

      return [
        ...(deff?.getFonts?.({ values: object.properties }) || []),
      ];
    })
  );

  return uniqBy(fonts, (font) => {
    return font.fontFamily;
  });
}

export function getCustomIdClass({ customId }: { customId?: string }) {
  if (!customId) return "";

  return customId ? `custom-id-${customId}` : "";
}
