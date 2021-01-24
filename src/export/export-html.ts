import { forOwn, mapValues, pick } from "lodash-es";
import { ImageProperties, TextProperties } from "../inputs/types";
import { IObject, ITransitions, ObjectType } from "../objects/types";
import { ILayer, ILayers } from "../store/reducers/layers";
import { IObjects } from "../store/reducers/objects";
import { ISlide, ISlides } from "../store/reducers/slides";
import { nl2br } from "../utils/doom-utils/common";

export interface IExportData {
  html: string;
  transitionsDataArr: { objectClass: string; transitions: ITransitions }[];
}
export function generateExport(
  slides: ISlides,
  layers: ILayers,
  objects: IObjects
): IExportData {
  const slideArr = getSlideArr(slides);

  const transitionsDataArr: {
    objectClass: string;
    transitions: ITransitions;
  }[] = [];
  let html = "<div>"; // slides holder open

  slideArr.forEach((slide) => {
    html += "  <div class='slide-" + slide.id + "'>"; // slide open

    const layerArr: ILayer[] = getLayerArr(layers, slide.layerIds);
    layerArr.forEach((layer) => {
      const layerClassName = "layer-" + layer.id;
      if (layer.isBackground) {
        transitionsDataArr.push({
          objectClass: layerClassName,
          transitions: layer.transitions,
        });
      }

      html += "    <div class='" + layerClassName + "'>"; // layer open

      const objectArr = getObjectArr(objects, layer.objectIds);
      objectArr.forEach((object) => {
        const objectClassName = "object-" + object.id;

        // >> "left", "top", "width", "height"
        const sizeObj = pick(object, "left", "top", "width", "height");
        const objectStyle = mapValues(sizeObj, (size) => `${size}px`);

        let style = "";
        forOwn(objectStyle, function (value, key) {
          style += key + ":" + value + ";";
        });
        style += "position: absolute;";
        // << "left", "top", "width", "height"

        html +=
          "      <div class='" + objectClassName + "' style='" + style + "'>"; // object open

        transitionsDataArr.push({
          objectClass: objectClassName,
          transitions: object.transitions,
        });
        html += getObjectHtml(object);

        html += "      </div>"; // object close
      });

      html += "    </div>"; // layer close
    });

    html += "  </div>"; // slide close
  });

  html += "</div>"; //slides holder close

  return { html, transitionsDataArr };
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
    default:
      return "";
  }
}

export function getTextHtml(object: IObject) {
  const textProperties = object.definition.properties as TextProperties;

  //const sizeObj = pick(object, "left", "top", "width", "height");
  //const objectStyle = mapValues(sizeObj, (size) => `${size}px`);

  let style = "";
  style += "font-size: " + textProperties.fontSize.value + "px;";
  const c = textProperties.color.value;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += "font-weight: " + textProperties.weight.value + ";";
  //forOwn(objectStyle, function (value, key) {
  //  style += key + ":" + value + ";";
  //});
  style += "position: absolute;";

  return (
    "<p style='" + style + "'>" + nl2br(textProperties.text.value) + "</p>"
  );
}

function getImageHtml(object: IObject) {
  const imageProperties = object.definition.properties as ImageProperties;
  return "<img src='" + imageProperties.url.value.url + "'/>";
}
