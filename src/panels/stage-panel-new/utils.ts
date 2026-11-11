type GlobalVariables = "rotationInProgress" | "mouseDownObjectId";

export function setGlobalProp<T = unknown>(prop: GlobalVariables, value: T) {
  if (!window.DAAP) window.DAAP = {};
  window.DAAP = { ...window.DAAP, [prop]: value };
}

export function getGlobalProp<T = unknown>(prop: GlobalVariables): T {
  if (!window.DAAP) window.DAAP = {};
  return window.DAAP[prop] as T;
}
