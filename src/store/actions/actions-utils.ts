import { forOwn } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { ILayer } from "../reducers/i-layers";
import { IRect } from "../../utils/doom-utils/common";

/**
 * Return array of ids from object to root layer. Includes provided objectId as first element and layer id as last one.
 */
export function populateObjectThreeIds(
  ids: string[],
  currentId: string,
  objectById: {
    [id: string]: IObject;
  },
  layerById: {
    [id: string]: ILayer;
  },
  first = true
) {
  const object = objectById[currentId];

  if (object) {
    if (!first) {
      ids.unshift(object.id); // do not add selectedObject
    }
    if (object.parentId) {
      populateObjectThreeIds(
        ids,
        object.parentId,
        objectById,
        layerById,
        false
      );
    }
  } else if (layerById[currentId]) {
    ids.unshift(layerById[currentId].id);
  }
}

/**
 * return layer ancestor of object
 */
export function getAncestorLayer(
  object: IObject,
  layerById: {
    [id: string]: ILayer;
  },
  objectById: {
    [id: string]: IObject<{}>;
  }
): ILayer {
  if (layerById[object.parentId!]) return layerById[object.parentId!];

  return getAncestorLayer(objectById[object.parentId!], layerById, objectById);
}

/**
 * Iterate trough all objects and remove unlinkIds from object.objectIds
 */
export function unlinkObjectIds(
  unlinkIds: string[],
  objectById: {
    [id: string]: IObject<{}>;
  }
) {
  forOwn(objectById, (object: IObject) => {
    if (object.objectIds) {
      object.objectIds = object.objectIds.filter(
        (id) => !unlinkIds.includes(id)
      );
    }
  });
}

export function getObjectIdToSelect({
  targetId,
  activeObjectId,
  selectedObjectIds,
  objectById,
}: {
  targetId: string;
  activeObjectId: string | null | undefined;
  selectedObjectIds: string[];
  objectById: { [key: string]: IObject };
}): string | undefined {
  // check if current selected object is on path from targetId to root
  let objectToSelect: IObject | undefined = undefined;

  if (selectedObjectIds.includes(targetId)) {
    return targetId;
  }

  // if group is selected
  const currentGroupObjectIds = objectById[targetId]?.objectIds;
  if (currentGroupObjectIds && currentGroupObjectIds.length > 0) {
    // it has to be one of currentGroupObjectIds
    let iterObject = objectById[targetId];

    while (true) {
      if (currentGroupObjectIds.indexOf(iterObject.id)) {
        objectToSelect = iterObject;
        break;
      }
      if (!iterObject.parentId) {
        // this should never happen
        break;
      }
      iterObject = objectById[iterObject.parentId];
    }
  }

  return objectToSelect?.id ?? targetId;

  // if (selectedObjectIds.includes(targetId)) {
  //   return targetId;
  // }

  // let parentId = objectById[selectedObjectIds[0]].parentId;

  // // TODO - ovde stao
  // return "";
}

export function isObjectGroup(object: IObject): boolean {
  return object?.type === "group";
}

/**
 * Compute the bounding rect of an object after applying
 * rotation and scale from its top-left corner (transform-origin: top left).
 */
export function getTransformedObjectBounds(
  left: number,
  top: number,
  w: number,
  h: number,
  rotation: number,
  scale: number,
): IRect {
  const r = (rotation * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);

  const corners = [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ].map(([lx, ly]) => ({
    x: left + lx * scale * cos - ly * scale * sin,
    y: top + lx * scale * sin + ly * scale * cos,
  }));

  const minX = Math.min(...corners.map((c) => c.x));
  const minY = Math.min(...corners.map((c) => c.y));
  const maxX = Math.max(...corners.map((c) => c.x));
  const maxY = Math.max(...corners.map((c) => c.y));

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function isObjectInGroup(
  object: IObject,
  objectById: { [key: string]: IObject }
): boolean {
  return objectById[object?.parentId!]?.type === "group";
}
