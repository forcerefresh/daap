import { forOwn } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { Point, Rect } from "../../webslider-sdk/object/i-tool-class";
import { getAbsEl } from "./WithRotationHandle";
import { degrees_to_radians } from "./StageManagerProvider";
import { isObjectGroup } from "../../store/actions/actions-utils";
import { ILayer } from "../../store/reducers/i-layers";

export interface CreateGroupWithObjectsProps {
  group: IObject;
  objects?: IObject[];
  parentLayer: ILayer;
  breakpointConfig: BreakpointConfiguration;
}

export function getUngroupObjectsCalculation(
  props: CreateGroupWithObjectsProps
): {
  [key: string]: {
    scale: number;
    rotation: number;
    left: number;
    top: number;
  };
} {
  const { group, parentLayer, objects, breakpointConfig } = props;

  // const calculatedGroupObjectSize = calculateObjectSize(
  //   group,
  //   parentLayer,
  //   breakpointConfig!,
  //   {
  //     resetPosition: false,
  //   }
  // );

  // NOTE: LAYOUT CHANGE
  // const groupObjectSize = {
  //   x: parseFloat(group.absoluteLayout?.common.left!),
  //   y: parseFloat(group.absoluteLayout?.common.top!),
  //   width: parseFloat(group.absoluteLayout?.common.width!),
  //   height: parseFloat(group.absoluteLayout?.common.height!),
  // };
  const groupObjectSize = {
    x: group.left!,
    y: group.top!,
    width: group.width!,
    height: group.height,
  };

  const getGroupMatrix = () => {
    const m = new DOMMatrix();
    m.translateSelf(groupObjectSize.x, groupObjectSize.y);
    m.rotateSelf(group.rotation);
    m.scaleSelf(group.scale);
    return m;
  };

  let ret: {
    [key: string]: {
      scale: number;
      rotation: number;
      left: number;
      top: number;
    };
  } = {};

  objects?.map((obj) => {
    // NOTE: LAYOUT CHANGE
    // const objectSize = {
    //   x: parseFloat(obj.absoluteLayout?.common.left!),
    //   y: parseFloat(obj.absoluteLayout?.common.top!),
    //   width: parseFloat(obj.absoluteLayout?.common.width!),
    //   height: parseFloat(obj.absoluteLayout?.common.height!),
    // };
    const objectSize = {
      x: obj.left!,
      y: obj.top!,
      width: obj.width!,
      height: obj.height!,
    };

    const objectMatrix = getGroupMatrix();
    objectMatrix.translateSelf(objectSize.x, objectSize.y);
    objectMatrix.rotateSelf(obj.rotation);
    objectMatrix.scaleSelf(obj.scale);

    const objectDecMatrix = decomposeMatrix2DW3(objectMatrix);

    ret[obj.id] = {
      scale: objectDecMatrix.scaleX,
      rotation: objectDecMatrix.rotateZ,
      left: objectDecMatrix.translateX,
      top: objectDecMatrix.translateY,
    };
  });

  return ret;
}

export function getUngroupObjectsCalculationOld(
  props: CreateGroupWithObjectsProps
): {
  [key: string]: {
    scale: number;
    rotation: number;
    left: number;
    top: number;
  };
} {
  const { group, parentLayer, objects, breakpointConfig } = props;

  const rootEl = addElement("root-el", document.body);

  const calculatedObjectSize = calculateObjectSize(
    group,
    parentLayer,
    breakpointConfig!,
    {
      resetPosition: false,
    }
  );

  const objectHolderStyle: Partial<CSSStyleDeclaration> = {
    zIndex: "100",
    position: "absolute",
    left: calculatedObjectSize.left as string,
    top: calculatedObjectSize.top as string,
    width: (calculatedObjectSize.width as string) ?? "0px",
    height: (calculatedObjectSize.height as string) ?? "0px",
    border: "0.5 dotted red",
    transform: `rotate(${group.rotation}deg) scale(${group.scale})`,
    transformOrigin: "top left",
  };

  const groupEl = addElement("group", rootEl, { style: objectHolderStyle });

  const groupMatrix = new DOMMatrix(objectHolderStyle.transform);

  const decMatrix = decomposeMatrix2DW3(groupMatrix);

  //
  // OBJECT
  //

  let ret: {
    [key: string]: {
      scale: number;
      rotation: number;
      left: number;
      top: number;
    };
  } = {};

  objects?.map((obj) => {
    const calculatedObjectSize2 = calculateObjectSize(
      obj,
      parentLayer,
      breakpointConfig!,
      {
        resetPosition: false,
      }
    );

    const objectHolderStyle2: Partial<CSSStyleDeclaration> = {
      zIndex: "100",
      position: "absolute",
      left: calculatedObjectSize2.left as string,
      top: calculatedObjectSize2.top as string,
      width: (calculatedObjectSize2.width as string) ?? "0px",
      height: (calculatedObjectSize2.height as string) ?? "0px",
      border: "0.5 solid green",
      transform: `rotate(${obj.rotation}deg) scale(${obj.scale})`,
      transformOrigin: "top left",
    };

    const objectEl = addElement("obj_" + obj.id, groupEl, {
      style: objectHolderStyle2,
    });

    const cstyle = getComputedStyle(objectEl);
    const h = parseFloat(cstyle.height);
    const w = parseFloat(cstyle.width);

    const bbox = objectEl.getBoundingClientRect();
    const cy = bbox.top + bbox.height / 2;
    const cx = bbox.left + bbox.width / 2;
    const top = cy - h / 2;
    const left = cx - w / 2;

    //
    //MARTIX
    const objectMatrix = groupMatrix.multiply(
      new DOMMatrix(objectHolderStyle2.transform)
    );

    objectMatrix.e = objectMatrix.f = 0;

    const objectDecMatrix = decomposeMatrix2DW3(objectMatrix);

    ret[obj.id] = {
      scale: objectDecMatrix.scaleX,
      rotation: objectDecMatrix.rotateZ,
      left,
      top,
    };
  });

  return ret;
}

function addElement(
  className: string,
  parent: HTMLElement,
  props?: { style?: Partial<CSSStyleDeclaration> }
) {
  const existingEl = document.getElementsByClassName(className)[0];
  if (existingEl) {
    existingEl.parentElement?.removeChild(existingEl);
  }
  const { style = {} } = props ?? {};

  const el = document.createElement("div");
  el.className = className;
  el.style.position = "absolute";
  el.style.zIndex = "2000";
  el.style.top = "0px";
  el.style.left = "0px";
  el.style.pointerEvents = "none";
  el.style.transformOrigin = "top left";
  //el.style.boxSizing = "border-box";

  forOwn(style, (value, key) => {
    el.style.setProperty(key, value as string);
  });

  if (parent) parent.appendChild(el);

  return el;
}

export function decomposeMatrix2DW3(m: DOMMatrix) {
  var row0x = m.a;
  var row0y = m.b;
  var row1x = m.c;
  var row1y = m.d;

  var scaleX = Math.sqrt(row0x * row0x + row0y * row0y);
  var scaleY = Math.sqrt(row1x * row1x + row1y * row1y);

  // If determinant is negative, one axis was flipped.
  var determinant = row0x * row1y - row0y * row1x;
  if (determinant < 0)
    if (row0x < row1y)
      // Flip axis with minimum unit vector dot product.
      scaleX = -scaleX;
    else scaleY = -scaleY;

  // Renormalize matrix to remove scale.
  if (scaleX) {
    row0x *= 1 / scaleX;
    row0y *= 1 / scaleX;
  }

  if (scaleY) {
    row1x *= 1 / scaleY;
    row1y *= 1 / scaleY;
  }

  // Compute rotation and renormalize matrix.
  var angle = Math.atan2(row0y, row0x);

  if (angle) {
    // Rotate(-angle) = [cos(angle), sin(angle), -sin(angle), cos(angle)]
    //                = [row0x, -row0y, row0y, row0x]
    // Thanks to the normalization above.
    var sn = -row0y;
    var cs = row0x;
    var m11 = row0x;
    var m12 = row0y;
    var m21 = row1x;
    var m22 = row1y;
    row0x = cs * m11 + sn * m21;
    row0y = cs * m12 + sn * m22;
    row1x = -sn * m11 + cs * m21;
    row1y = -sn * m12 + cs * m22;
  }

  m11 = row0x;
  m12 = row0y;
  m21 = row1x;
  m22 = row1y;

  // Convert into degrees because our rotation functions expect it.
  angle = angle * (180 / Math.PI);
  // The requested parameters are then theta,
  // sx, sy, phi,
  return {
    translateX: m.e,
    translateY: m.f,
    rotateZ: angle,
    scaleX: scaleX,
    scaleY: scaleY,
    matrix: [m11, m12, m21, m22, 0, 0],
  };
}

export function createTransformForPath(
  groupsPath: string[],
  objectById: {
    [id: string]: IObject<{}>;
  },
  config?: {
    inverseRotation?: boolean;
    includeTranslate?: boolean;
  },
  overrideObjectSize?: {
    [key: string]: Pick<IObject, "left" | "top" | "width" | "height">;
  }
) {
  return groupsPath.map((id: string) => {
    let object = objectById[id];

    if (overrideObjectSize && overrideObjectSize[id]) {
      object = { ...object, ...overrideObjectSize[id] };
    }

    const rotationSign = config?.inverseRotation ? "-" : "";

    // NOTE: LAYOUT CHANGE
    // const translate = config?.includeTranslate
    //   ? `translateX(${object.absoluteLayout?.common.left}) translateY(${object.absoluteLayout?.common.top})`
    //   : "";
    const translate = config?.includeTranslate
      ? `translateX(${object.left}px) translateY(${object.top}px)`
      : "";

    let left = "",
      right = "";
    isObjectGroup(object) ? (right = translate) : (left = translate);

    return `${translate} rotate(${rotationSign}${
      object.rotation ?? 0
    }deg) scale(${object.scale ?? 1})`;
  });
}

export function getFullMatrixFromTransformArr(arr: string[]): DOMMatrix {
  if (arr.length === 0) return new DOMMatrix();
  const transformStr = arr.pop();
  const matrix = new DOMMatrix(transformStr);
  return getFullMatrixFromTransformArr(arr).multiply(matrix);
}

export function getGroupMatrixFromSelectionPath(
  selectionPath: string[],
  objectById: {
    [id: string]: IObject<{}>;
  },
  options?: { includeTranslate?: boolean },
  overrideObjectSize?: {
    [key: string]: Pick<IObject, "left" | "top" | "width" | "height">;
  }
) {
  const groupsPath = [...selectionPath];
  groupsPath.shift();

  const transformArrayRef = createTransformForPath(
    groupsPath,
    objectById,
    {
      inverseRotation: false,
      includeTranslate: options?.includeTranslate,
    },
    overrideObjectSize
  );

  const groupsMatrix = getFullMatrixFromTransformArr(transformArrayRef);

  return groupsMatrix;
}

export function screenPointToLocal(
  diff: Point,
  localMatrix: DOMMatrix,
  rotation?: number,
  scale?: number
) {
  const pointMatrix = new DOMMatrix(
    (rotation ? `rotate(${rotation}deg) ` : "") +
      (scale ? `scale(${scale}) ` : "") +
      `translateX(${diff.x}px) translateY(${diff.y}px)`
  );

  const objectMatrix = localMatrix.inverse().multiply(pointMatrix);

  const objectDecMatrix = decomposeMatrix2DW3(objectMatrix);

  return {
    x: objectDecMatrix.translateX,
    y: objectDecMatrix.translateY,
  };
}

export function getObjectBBoxRelativeToParent(
  rotate: number,
  scale: number,
  left: number,
  top: number
): Point {
  //TODO return Rect
  const pointMatrix = new DOMMatrix(
    `translateX(${left}px) translateY(${top}px)`
  );

  const localMatrix = new DOMMatrix(
    (rotate ? `rotate(${rotate}deg) ` : "") + (scale ? `scale(${scale}) ` : "")
  );

  const resultMatrix = localMatrix.inverse().multiply(pointMatrix);

  const objectDecMatrix = decomposeMatrix2DW3(resultMatrix);

  return {
    x: objectDecMatrix.translateX,
    y: objectDecMatrix.translateY,
  };
}

export function getObjectTransform(
  object: IObject,
  override?: Partial<Pick<IObject, "scale" | "rotation">>
): string {
  return (
    "rotate(" +
    (override?.rotation ?? object.rotation ?? 0) +
    "deg) scale(" +
    (override?.scale ?? object.scale ?? 1) +
    ")"
  );
}

// TODO

export function getCorners(
  x: number,
  y: number,
  w: number,
  h: number,
  R: number,
  scale: number
) {
  let cxOrg = w / 2,
    cyOrg = h / 2;

  let cx = (w / 2) * scale,
    cy = (h / 2) * scale,
    r = toRadians(R);

  let X = x + cxOrg,
    Y = y + cyOrg;

  let bl = GetPoint(X, Y, r, -cx, cy);
  let br = GetPoint(X, Y, r, cx, cy);
  let tl = GetPoint(X, Y, r, -cx, -cy);
  let tr = GetPoint(X, Y, r, cx, -cy);

  return { tl, tr, bl, br };

  // TweenMax.set("#top-left", { x: tl.x, y: tl.y });
  // TweenMax.set("#bot-left", { x: bl.x, y: bl.y });
  // TweenMax.set("#bot-right", { x: br.x, y: br.y });
  // TweenMax.set("#top-right", { x: tr.x, y: tr.y });

  // $("textarea#data").val(
  //   JSON.stringify(
  //     { botRight: br, botLeft: bl, topRight: tr, topLeft: tl },
  //     null,
  //     4
  //   )
  // );
}

function GetPoint(X: number, Y: number, rot: number, Xos: number, Yos: number) {
  var rotatedX = X + Xos * Math.cos(rot) - Yos * Math.sin(rot);
  var rotatedY = Y + Xos * Math.sin(rot) + Yos * Math.cos(rot);
  return { x: Math.round(rotatedX), y: Math.round(rotatedY) };
}

function toRadians(angle: number) {
  return angle * (Math.PI / 180);
}

export interface ICorners {
  tl: Point;
  tr: Point;
  bl: Point;
  br: Point;
}
export function removeCornerMarkers(parentId: string) {
  const cornersEls = document.getElementsByClassName(
    `object-corner-${parentId}`
  );
  Array.from(cornersEls).forEach((el) => el.parentElement?.removeChild(el));
}

export function addCornerMarkers(
  parentId: string,
  corners: ICorners,
  color?: string
) {
  const parentHolder = document.getElementsByClassName(
    `object-holder-${parentId}`
  )[0] as HTMLDivElement;

  addCorner(parentHolder, corners.tl, parentId, color);
  addCorner(parentHolder, corners.tr, parentId, color);
  addCorner(parentHolder, corners.bl, parentId, color);
  addCorner(parentHolder, corners.br, parentId, color);
}

function addCorner(
  parentEl: HTMLDivElement,
  p: Point,
  parentId: string,
  color?: string
) {
  if (!p) return;

  const el = getAbsEl(Math.random().toString(), p);
  el.className = `object-corner-${parentId}`;
  if (color) el.style.background = color;
  parentEl.appendChild(el);
}

export function getLeftTopFromCorners(corners: ICorners) {
  let x = 100000000;
  let y = 100000000;

  x = Math.min(x, corners.tl.x);
  y = Math.min(y, corners.tl.y);

  x = Math.min(x, corners.tr.x);
  y = Math.min(y, corners.tr.y);

  x = Math.min(x, corners.bl.x);
  y = Math.min(y, corners.bl.y);

  x = Math.min(x, corners.br.x);
  y = Math.min(y, corners.br.y);

  return { x, y };
}

export function getBottomRightFromCorners(corners: ICorners) {
  let x = -100000000;
  let y = -100000000;

  x = Math.max(x, corners.tl.x);
  y = Math.max(y, corners.tl.y);

  x = Math.max(x, corners.tr.x);
  y = Math.max(y, corners.tr.y);

  x = Math.max(x, corners.bl.x);
  y = Math.max(y, corners.bl.y);

  x = Math.max(x, corners.br.x);
  y = Math.max(y, corners.br.y);

  return { x, y };
}
// ++++++++++=

export function tmpDrawNewGroup(
  parentGroup: IObject,
  parentLayer: ILayer,
  object: IObject,
  xyDiff: Point,
  bboxW: number,
  bboxH: number
) {
  const layerEl = getElementByClass("layer-" + parentLayer.id);

  // NOTE: LAYOUT CHANGE
  // const x = parseFloat(parentGroup.absoluteLayout?.common!.left!);
  // const y = parseFloat(parentGroup.absoluteLayout?.common!.top!);
  // const width = parseFloat(parentGroup.absoluteLayout?.common!.width!);
  // const height = parseFloat(parentGroup.absoluteLayout?.common!.height!);
  const x = parentGroup.left!;
  const y = parentGroup.top!;
  const width = parentGroup.width!;
  const height = parentGroup.height!;
  const scale = parentGroup.scale ?? 1;
  const rotate = parentGroup.rotation ?? 0;

  //const adjustmentX = 0; //scale === 1 ? 0 : (width - width / scale) / 2;

  const existingGroupProps = { x, y, width, height, rotate, scale };

  // SCALE ADJUSTMENT
  const adjustmentX = (width * scale - width) / 4;
  const adjustmentY = (height * scale - height) / 4;

  const adjX =
    adjustmentX * Math.cos(degrees_to_radians(rotate)) -
    adjustmentY * Math.sin(degrees_to_radians(rotate));

  const adjY =
    adjustmentX * Math.sin(degrees_to_radians(rotate)) +
    adjustmentY * Math.cos(degrees_to_radians(rotate));

  const newGroupProps = {
    x:
      x +
      (xyDiff.x * Math.cos(degrees_to_radians(rotate)) -
        xyDiff.y * Math.sin(degrees_to_radians(rotate))) *
        +adjX,

    y:
      y +
      (xyDiff.x * Math.sin(degrees_to_radians(rotate)) +
        xyDiff.y * Math.cos(degrees_to_radians(rotate))) *
        scale +
      adjY,

    //height / scale,

    // width,
    // height,
    // rotate,
    // scale,
  };

  const newGroupCorners = getCorners(
    newGroupProps.x,
    newGroupProps.y,
    bboxW,
    bboxH,
    parentGroup.rotation ?? 0,
    parentGroup.scale ?? 1
  );

  const topLEftGroupPoint = getLeftTopFromCorners(newGroupCorners);

  const pointMatrix = new DOMMatrix(
    `translateX(${xyDiff.x}px) translateY(${xyDiff.y}px)`
  );

  const newGroupMatrix = new DOMMatrix(
    `rotate(${parentGroup.rotation}deg) scale(${parentGroup.scale})`
  );

  const resultMatrix = pointMatrix.inverse().multiply(newGroupMatrix);
  const resultDecMatrix = decomposeMatrix2DW3(resultMatrix);

  const diff2 = {
    x: resultDecMatrix.translateX,
    y: resultDecMatrix.translateY,
  };

  // >>
  removeElementByClass("diff-el");
  const diffGroupEl = getAbsEl(Math.random().toString(), diff2, false);
  diffGroupEl.className = "diff-el";
  layerEl.appendChild(diffGroupEl);
  // <<

  const className = "group-new-" + parentGroup.id;
  removeElementByClass(className);
  const tmpGroupEl = getAbsEl(Math.random().toString(), newGroupProps, false);
  tmpGroupEl.className = className;
  tmpGroupEl.style.width = bboxW + "px";
  tmpGroupEl.style.height = bboxH + "px";
  tmpGroupEl.style.border = "1px solid red";
  tmpGroupEl.style.backgroundColor = "transparent";
  tmpGroupEl.style.transform = getObjectTransform(parentGroup);

  layerEl.appendChild(tmpGroupEl);

  return { ...newGroupProps, width: bboxW, height: bboxH };
}

export function getElementByClass(className: string) {
  return document.getElementsByClassName(className)[0];
}

export function getElementBySelector(selector: string) {
  return document.querySelector(selector);
}

export function removeElementByClass(className: string) {
  const el = document.getElementsByClassName(className)[0];
  if (el) {
    el.parentElement?.removeChild(el);
  }
}
