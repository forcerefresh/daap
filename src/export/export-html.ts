import { forOwn, mapValues, pick } from "lodash-es";
import { ImageProperties, TextProperties } from "../inputs/types";
import {
  IObject,
  IObjectEvent,
  ISlideTransition,
  ITransitions,
  ObjectType,
} from "../objects/types";
import { ILayer, ILayers } from "../store/reducers/layers";
import { IObjects } from "../store/reducers/objects";
import {
  ISlide,
  ISlideDuration,
  ISlides,
  SlideType,
} from "../store/reducers/slides";
import { IPreviewScope } from "../store/reducers/stage";
import { nl2br } from "../utils/doom-utils/common";

export interface ITransitionsData {
  objectClass: string;
  transitions: ITransitions;
  events: IObjectEvent[];
  data: {
    slideDuration: ISlideDuration;
    objectWidth?: number;
    objectHeight?: number;
    objectLeft?: number;
    objectTop?: number;
    objectHtml?: string;
    overflow: string;
  };
}

export interface ISlideTransitionData {
  transitions: ITransitions;
}

export interface IPlayerData {
  html: string;
  slideDataArr: ISlideData[];
}

export interface ISources {
  slides: ISlides;
  layers: ILayers;
  objects: IObjects;
}

export interface ISlideData {
  slide: {
    id: string;
    slideType: SlideType;
    slideTransition: ISlideTransition;
    duration: ISlideDuration;
  };
  transitionsData: ITransitionsData[];
}

export function generatePlayerData(
  sources: ISources,
  scope: IPreviewScope | null
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

      //if (layer.isBackground) {
      /* transitionsDataArr.push({
          objectClass: layerClassName,
          transitions: layer.transitions,
          data: {
            slideDuration: slide.duration,
          },
        });*/
      //}

      html += `    <div class="${layerClassName}">`; // layer open

      const objectArr = getObjectArr(objects, layer.objectIds);
      objectArr.forEach((object) => {
        const objectClass = "object-" + object.id;

        // >> "left", "top", "width", "height"
        const sizeObj = pick(object, "left", "top", "width", "height");
        const objectStyle = mapValues(sizeObj, (size) => `${size}px`);

        let style = "";
        forOwn(objectStyle, function (value, key) {
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
        const objectHtml = getObjectHtml(object);

        transitionsData.push({
          objectClass: objectClass,
          transitions: object.transitions,
          events: object.events,
          data: {
            slideDuration: slide.duration,
            objectWidth: object.width,
            objectHeight: object.height,
            objectLeft: object.left,
            objectTop: object.top,
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

export function getObjectHtml(object: IObject) {
  switch (object.type) {
    case ObjectType.TEXT:
      return getTextHtml(object);
    case ObjectType.IMAGE:
      return getImageHtml(object);
    case ObjectType.VIDEO:
      return getVideoHtml(object);
    default:
      return "";
  }
}

export function getTextHtml(object: IObject) {
  const textProperties = object.definition.properties as TextProperties;

  //const sizeObj = pick(object, "left", "top", "width", "height");
  //const objectStyle = mapValues(sizeObj, (size) => `${size}px`);

  let style = "";
  style += "font-family: " + textProperties.font.value.fontFamily + ";";
  style += "font-size: " + textProperties.fontSize.value + "px;";
  const c = textProperties.color.value;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += "font-weight: " + textProperties.weight.value + ";";
  //forOwn(objectStyle, function (value, key) {
  //  style += key + ":" + value + ";";
  //});
  style += "position: absolute;";

  return `<p class="object-content" style="${style}">${nl2br(
    textProperties.text.value
  )}</p>`;
}

function getImageHtml(object: IObject) {
  const imageProperties = object.definition.properties as ImageProperties;
  if (imageProperties.url.value.isPlaceholder) {
    return `<div style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">IMAGE<br/>PLACEHOLDER</div>`;
  }
  return `<img class="object-content" src="${imageProperties.url.value.url}" width="${object.width}" height="${object.height}"/>`;
}

function getVideoHtml(object: IObject) {
  const imageProperties = object.definition.properties as ImageProperties;
  if (imageProperties.url.value.isPlaceholder) {
    return `<div style="background-color: #eee; color: #1f82c0; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">VIDEO<br/>PLACEHOLDER</div>`;
  }

  const videoHtml = `<video style="object-fit: fill;" no-controls autoplay width="${object.width}" height="${object.height}">
    <source src="${imageProperties.url.value.url}" type="video/mp4">
  </video>`;

  return videoHtml;

  //Sorry, your browser doesn't support embedded videos.

  //return `<img class="object-content" src="${imageProperties.url.value.url}" width="${object.width}" height="${object.height}"/>`;
}
