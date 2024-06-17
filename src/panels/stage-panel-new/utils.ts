type GlobalVariables = "rotationInProgress" | "mouseDownObjectId";

export function setGlobalProp<T = any>(prop: GlobalVariables, value: T) {
  const global = window as any;

  if (!global.DAAP) global.DAAP = {};

  global.DAAP = { ...global.DAAP, [prop]: value };
}

export function getGlobalProp<T = any>(prop: GlobalVariables) {
  const global = window as any;

  if (!global.DAAP) global.DAAP = {};

  return global.DAAP[prop];
}
