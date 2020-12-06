import { forOwn, map, mapValues, pick } from "lodash-es";
import { TextProperties } from "../inputs/types";
import { IObject, ITransitions, ObjectType } from "../objects/types";
import { ILayer, ILayers } from "../store/reducers/layers";
import { IObjects } from "../store/reducers/objects";
import { ISlide, ISlides } from "../store/reducers/slides";

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
      html += "    <div class='layer-" + layer.id + "'>"; // layer open

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
    default:
      return "";
  }
}

function getTextHtml(object: IObject) {
  const textProperties = object.definition.properties as TextProperties;

  const sizeObj = pick(object, "left", "top", "width", "height");
  //const objectStyle = mapValues(sizeObj, (size) => `${size}px`);

  let style = "";
  style += "font-size: " + textProperties.fontSize.value + "px;";
  //forOwn(objectStyle, function (value, key) {
  //  style += key + ":" + value + ";";
  //});
  style += "position: absolute;";

  return "<p style='" + style + "'>" + textProperties.text.value + "</p>";
}
