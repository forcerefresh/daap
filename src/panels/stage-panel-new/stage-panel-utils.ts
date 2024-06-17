import { forOwn } from "lodash-es";
import { ILayer, IObject } from "webslider-sdk/lib/objects/i-object";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { Point } from "../../webslider-sdk/object/i-tool-class";

export interface CreateGroupWithObjectsProps {
  group: IObject;
  objects?: IObject[];
  parentLayer: ILayer;
  breakpointConfig: BreakpointConfiguration;
}

export function createGroupWithObjects(props: CreateGroupWithObjectsProps) {
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
  };

  const groupEl = addElement("group", rootEl, { style: objectHolderStyle });

  const groupMatrix = new DOMMatrix(objectHolderStyle.transform);
  //console.log(objectHolderStyle.transform);

  const decMatrix = decomposeMatrix2DW3(groupMatrix);

  //  console.log(decMatrix);

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
  }
) {
  return groupsPath.map((id: string) => {
    const object = objectById[id];

    const rotationSign = config?.inverseRotation ? "-" : "";
    return `rotate(${rotationSign}${object.rotation}deg) scale(${object.scale})`;
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
  }
) {
  const groupsPath = [...selectionPath];
  groupsPath.shift();

  const transformArrayRef = createTransformForPath(groupsPath, objectById, {
    inverseRotation: false,
  });

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

export function getObjectTransform(
  object: IObject,
  override?: Partial<Pick<IObject, "scale" | "rotation">>
): string {
  console.log(override?.rotation);
  return (
    "rotate(" +
    (override?.rotation ?? object.rotation) +
    "deg) scale(" +
    (override?.scale ?? object.scale ?? 1) +
    ")"
  );
}
