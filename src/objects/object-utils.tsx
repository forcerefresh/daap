import { IObject } from "webslider-sdk/lib/objects/i-object";

export function getObjectRotation(object: IObject): number {
  return object.rotation ?? 0;
}

export function getObjectScale(object: IObject): number {
  return object.scale ?? 1;
}
