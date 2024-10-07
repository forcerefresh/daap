import { forOwn } from "lodash-es";
import { ILayer, IObject } from "webslider-sdk/lib/objects/i-object";

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
    if (!first) ids.unshift(object.id); // do not add selectedObject
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
  return !!object?.objectIds && object.objectIds.length > 0;
}

export function isObjectInGroup(
  object: IObject,
  objectById: { [key: string]: IObject }
): boolean {
  if (!object.parentId) return false;
  if (!objectById[object.parentId]?.objectIds) return false;

  return objectById[object.parentId].objectIds!.length > 0;
}
