import { cloneDeep, forOwn, isEmpty, pick } from "lodash-es";
import { ColorTheme } from "../types/colors";
import { hexToRGB } from "../../utils/utils";
import { TEXT } from "../../objects/text/text";
import { RECTANGLE } from "../../objects/rectangle/rectangle";
import { createObject } from "../../objects/create-object-factory";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { IMAGE } from "../../objects/image/image";

export function updateLayout(layout: any, iaResponseJson: Record<string, any>) {
  if (!iaResponseJson) return;

  const newLayout = cloneDeep(layout);

  try {
    iaResponseJson.objects.forEach((obj: any) => {
      const objectId = obj.objectId;
      //   const layoutObj = JSON.parse(formState.layout!)
      //  const objectId = layoutObj[idx].objectId
      const existingObj = newLayout.objects.objectById[objectId];

      if (obj.bounds) {
        existingObj.left = obj.bounds.left;
        existingObj.top = obj.bounds.top;
        existingObj.width = obj.bounds.width;
        existingObj.height = obj.bounds.height;
      }
      if (obj.properties?.fontSize) {
        existingObj.properties.fontSize = obj.properties.fontSize;
      }

      if (obj.properties?.lineHeight) {
        existingObj.properties.lineHeight = obj.properties.lineHeight;
      }
    });
  } catch (ex) {
    debugger;
  }

  return newLayout;
}

export function updateTemplate(
  templateToUpdate: any,
  layout: any,
  iaResponseJson: Record<string, any>,
  selectedColorSet: ColorTheme,
  imageMeta?: { mediaId: string; objectId: string }[],
  vectorMeta?: { mediaId: string; objectId: string }[],
  overridesObjectProperties?: Record<string, any>
) {
  if (!iaResponseJson) return;

  const newTemplate = cloneDeep(layout);

  // TODO brandColors?.[0]
  let colors = iaResponseJson.brandColors?.[0] ?? iaResponseJson.brandColors;

  if (!isEmpty(selectedColorSet)) {
    colors = selectedColorSet;
  }

  let aiResponseStrUpdated = JSON.stringify(iaResponseJson);
  forOwn(colors, (color, alias) => {
    if (!color) {
      console.log(color);
      console.log(colors);
      console.log(iaResponseJson);
      console.log("ERROR A7");
      debugger;
    }
    console.log(`{COLOR_${alias.toUpperCase()}}`);

    aiResponseStrUpdated = aiResponseStrUpdated.replaceAll(
      `"{COLOR_${alias.toUpperCase()}}"`,
      JSON.stringify(hexToRGB(color))
    );
  });

  console.log(aiResponseStrUpdated);

  try {
    const aiResponseObjectUpdated = JSON.parse(aiResponseStrUpdated);
    aiResponseObjectUpdated.objects.forEach((obj: any) => {
      const objectId = obj.objectId;
      //   const layoutObj = JSON.parse(formState.layout!)
      //  const objectId = layoutObj[idx].objectId
      const existingObj = newTemplate.objects.objectById[objectId];

      if (obj.type === "text") {
        const mergedProperties = {
          ...obj.properties,
          ...(overridesObjectProperties?.[objectId]
            ? overridesObjectProperties[objectId]
            : {}),
        };

        replaceLayoutObject(
          newTemplate,
          existingObj,
          TEXT,

          pick(existingObj, "left", "top", "width", "height", "rotation"),

          {
            ...mergedProperties,
            // font: previewFont!,
            // autoHeight: true,
            // initialAutoWidth: true,
            // fontSize: previewSize.size.toString() + "px",
            // type: previewSize.textType,
            // text: "Sample text",
            // ...replaceItem.values,
          }
        );
      } else if (obj.type === "background") {
        if (obj.subType === "solid") {
          replaceLayoutObject(
            newTemplate,
            existingObj,
            RECTANGLE,
            pick(existingObj, "left", "top", "width", "height", "rotation"),

            {
              strokeWidth: 0,
              strokeColor: undefined,
              fill: obj.properties.color,
            }
          );
        } else if (obj.subType === "gradient") {
          replaceLayoutObject(
            newTemplate,
            existingObj,
            RECTANGLE,
            pick(existingObj, "left", "top", "width", "height", "rotation"),

            {
              strokeWidth: 0,
              strokeColor: undefined,
              fill: {
                points: obj.properties.gradient.points,
                angle: 0,
              },
            }
          );
        }
      } else if (obj.type === "shape") {
        if (obj.subType === "rectangle") {
          replaceLayoutObject(
            newTemplate,
            existingObj,
            RECTANGLE,
            pick(existingObj, "left", "top", "width", "height", "rotation"),
            {
              strokeWidth: 0,
              strokeColor: undefined,
              fill: obj.properties.color,
            }
          );
        }
      }
    });

    imageMeta?.forEach(({ objectId, mediaId }) => {
      const existingObj = newTemplate.objects.objectById[objectId!];

      replaceLayoutObject(
        newTemplate,
        existingObj,
        IMAGE,

        pick(existingObj, "left", "top", "width", "height", "rotation"),

        {
          image: getImageProperties(mediaId!),
        }
      );
    });

    vectorMeta?.forEach(({ objectId, mediaId }) => {
      const existingObj = newTemplate.objects.objectById[objectId!];

      replaceLayoutObject(
        newTemplate,
        existingObj,
        IMAGE,

        pick(existingObj, "left", "top", "width", "height", "rotation"),

        {
          image: getVectorProperties(mediaId!),
        }
      );
    });
  } catch (ex) {
    throw ex;
    // console.log("ERROR A8");
    // // debugger; //asd
  }

  return newTemplate;
}

export function replaceLayoutObject(
  project: any,
  replaceObject: IObject,
  type: string,
  objectProps: Partial<IObject<{}>>,
  values?: {
    [key: string]: any;
  }
) {
  if (!replaceObject) {
    return;
  }

  let object: IObject = {
    ...createObject(type, objectProps, {
      ...values,
      //text: "Sample test",
    }),
    layerId: replaceObject.layerId,
    parentId: replaceObject.layerId,
  };

  object.id = replaceObject.id;

  // apply opacity
  const oldObject = project.objects.objectById[object.id];
  if (typeof oldObject.style?.opacity !== "undefined") {
    if (!object.style) object.style = {};
    object.style.opacity = oldObject.style.opacity;
  }
  if (typeof oldObject.rotation) {
    object.rotation = oldObject.rotation;
  }
  if (typeof oldObject.rotation) {
    object.rotation = oldObject.rotation;
  }

  project.objects.objectById[object.id] = object;
}

export function collectTextFromIaResponse(iaResponseJson: Record<string, any>) {
  console.log(iaResponseJson);

  const retAtt: {
    text: string;
    tag: string;
    properties: any;
    objectId: string;
  }[] = [];

  iaResponseJson.objects.forEach((object: any) => {
    if (object.type !== "text") return;

    retAtt.push({
      objectId: object.objectId,
      properties: object.properties,
      text: object.properties.text,
      tag: object.subType,
    });
  });

  return retAtt;
}

export function collectImagesFromIaResponse(iaResponseJson: any) {
  console.log(iaResponseJson);

  const retAtt: {
    prompt: string;
    imageObjectType: string;
    objectId: string;
  }[] = [];

  iaResponseJson.objects.forEach((object: any) => {
    if (object.type === "image" || object.subType === "image") {
      retAtt.push({
        prompt: object.aiPrompt,
        imageObjectType: object.subType,
        objectId: object.objectId,
      });
    }
  });

  return retAtt;
}

export function collectVectorFromIaResponse(iaResponseJson: any) {
  console.log(iaResponseJson);

  const retAtt: {
    prompt: string;
    vectorObjectType: string;
    objectId: string;
    color: string;
  }[] = [];

  iaResponseJson.objects.forEach((object: any) => {
    if (object.type === "vector" || object.subType === "vector") {
      retAtt.push({
        prompt: object.aiPrompt,
        vectorObjectType: object.subType,
        objectId: object.objectId,
        color: object?.properties?.color,
      });
    }
  });

  return retAtt;
}

export function getImageProperties(mediaId: string) {
  return {
    width: 1024,
    height: 1024,
    sourceType: "local",
    sizeType: "original",
    mediaSizes: [
      {
        sizeType: "thumbnail",
        width: 80,
        height: 80,
        sourceFilename: mediaId + "-thumbnail.webp",
      },
      {
        sizeType: "small",
        width: 150,
        height: 150,
        sourceFilename: mediaId + "-small.webp",
      },
      {
        sizeType: "medium",
        width: 300,
        height: 300,
        sourceFilename: mediaId + "-medium.webp",
      },
      {
        sizeType: "large",
        width: 600,
        height: 600,
        sourceFilename: mediaId + "-large.webp",
      },
      {
        sizeType: "xlarge",
        width: 900,
        height: 900,
        sourceFilename: mediaId + "-xlarge.webp",
      },
      {
        sizeType: "xxlarge",
        width: 1200,
        height: 1200,
        sourceFilename: mediaId + "-xxlarge.webp",
      },
      {
        sizeType: "original",
        width: 1024,
        height: 1024,
        sourceFilename: mediaId + ".webp",
      },
    ],
    id: mediaId,
  };
}

export function getVectorProperties(mediaId: string) {
  return {
    width: 1024,
    height: 1024,
    sourceType: "local",
    sizeType: "original",
    mediaSizes: [
      {
        sizeType: "original",
        width: 1024,
        height: 1024,
        sourceFilename: mediaId + ".svg",
      },
    ],
    id: mediaId,
  };
}
