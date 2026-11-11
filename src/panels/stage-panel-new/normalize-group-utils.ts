import { cloneDeep } from "lodash-es";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getUngroupObjectsCalculation } from "./stage-panel-utils";
import {
  boundsUnion,
  getObjectBoundingBox,
} from "../../store/helpers/objectBoundingBox";
import { getAncestorLayer } from "../../store/actions/actions-utils";
import { ILayer } from "../../store/reducers/i-layers";

export function normalizeGroup(
  parentGroup: IObject,
  changeObjectById: { [key: string]: IObject },
  utils: {
    objectById: { [key: string]: IObject };
    layerById: { [key: string]: ILayer };
    breakpointConfig?: BreakpointConfiguration;
  }
): {
  objects: IObject[];
  group: IObject;
} {
  const { objectById, breakpointConfig, layerById } = utils;

  const groupObjectsToUpdate =
    parentGroup.objectIds?.map((objectId) => {
      return changeObjectById[objectId] ?? cloneDeep(objectById[objectId]);
    }) ?? [];
  const calc = getUngroupObjectsCalculation({
    group: { ...parentGroup }, //, rotation: 0 },
    objects: groupObjectsToUpdate,
    breakpointConfig: breakpointConfig!,
    parentLayer: getAncestorLayer(parentGroup, layerById, objectById),
  });

  groupObjectsToUpdate.forEach((object: IObject) => {
    object.left = calc[object.id].left;
    object.top = calc[object.id].top;
    object.rotation = calc[object.id].rotation;
    object.scale = calc[object.id].scale;
  });

  const firstObject = groupObjectsToUpdate[0];

  // get group bounds (TODO: duplicate)
  let groupBounds = getObjectBoundingBox(firstObject);
  groupObjectsToUpdate.forEach((object) => {
    const bounds = getObjectBoundingBox(object);
    groupBounds = boundsUnion(groupBounds, bounds);
  });

  const retObject: IObject[] = [];
  groupObjectsToUpdate.forEach((object) => {
    object.top = object.top! - groupBounds.y;
    object.left = object.left! - groupBounds.x;
    retObject.push(object);
  });

  const retGroup = cloneDeep(parentGroup);

  retGroup.left = groupBounds.x;
  retGroup.top = groupBounds.y;
  retGroup.width = groupBounds.width;
  retGroup.height = groupBounds.height;
  retGroup.rotation = 0;
  retGroup.scale = 1;


  return { group: retGroup, objects: retObject };
}
