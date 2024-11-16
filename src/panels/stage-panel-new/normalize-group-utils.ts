import { cloneDeep } from "lodash-es";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getUngroupObjectsCalculation } from "./stage-panel-utils";
import { getLayerIdRec } from "./StageManagerProvider";
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

  const groupRotation = parentGroup.rotation;

  const groupObjectsToUpdate =
    parentGroup.objectIds?.map((objectId) => {
      return changeObjectById[objectId] ?? cloneDeep(objectById[objectId]);
    }) ?? [];
  //1. "UNGROUP"
  const calc = getUngroupObjectsCalculation({
    group: { ...parentGroup }, //, rotation: 0 },
    objects: groupObjectsToUpdate,
    breakpointConfig: breakpointConfig!,
    parentLayer: getAncestorLayer(parentGroup, layerById, objectById),
  });

  groupObjectsToUpdate.forEach((object: IObject) => {
    // NOTE: LAYOUT CHANGE
    // object.absoluteLayout!.common.left = calc[object.id].left + "px";
    // object.absoluteLayout!.common.top = calc[object.id].top + "px";
    object.left = calc[object.id].left;
    object.top = calc[object.id].top;
    object.rotation = calc[object.id].rotation;
    object.scale = calc[object.id].scale;
  });

  //2. "GROUP"
  const firstObject = groupObjectsToUpdate[0];

  // get group bounds (TODO: duplicate)
  let groupBounds = getObjectBoundingBox(firstObject);
  groupObjectsToUpdate.forEach((object) => {
    const bounds = getObjectBoundingBox(object);
    groupBounds = boundsUnion(groupBounds, bounds);
  });

  //const objects: IObject[] = [];
  //  normalize object pos
  const retObject: IObject[] = [];
  groupObjectsToUpdate.forEach((object) => {
    // NOTE: LAYOUT CHANGE
    // object.absoluteLayout!.common.top =
    //   parseFloat(object.absoluteLayout!.common.top) - groupBounds.y + "px";
    // object.absoluteLayout!.common.left =
    //   parseFloat(object.absoluteLayout!.common.left) - groupBounds.x + "px";
    object.top = object.top! - groupBounds.y;
    object.left = object.left! - groupBounds.x;
    retObject.push(object);
  });

  const retGroup = cloneDeep(parentGroup);

  // NOTE: LAYOUT CHANGE
  // retGroup.absoluteLayout!.common.left = groupBounds.x + "px";
  // retGroup.absoluteLayout!.common.top = groupBounds.y + "px";
  // retGroup.absoluteLayout!.common.width = groupBounds.width + "px";
  // retGroup.absoluteLayout!.common.height = groupBounds.height + "px";
  retGroup.left = groupBounds.x;
  retGroup.top = groupBounds.y;
  retGroup.width = groupBounds.width;
  retGroup.height = groupBounds.height;
  retGroup.rotation = 0; //groupRotation;
  retGroup.scale = 1; //groupRotation;

  //parentGroupClone.rotation = groupRotation;
  return { group: retGroup, objects: retObject };
}
