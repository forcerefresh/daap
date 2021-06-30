export interface IPoint {
  x: number;
  y: number;
}

export interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ISize {
  width: number;
  height: number;
}

export function getMousePosition(e: React.MouseEvent) {
  var rect = e.currentTarget.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  return { x, y };
}

export function getRectFromPoints(p1: IPoint, p2: IPoint) {
  return {
    x: Math.min(p1.x, p2.x),
    y: Math.min(p1.y, p2.y),
    w: p2.x > p1.x ? p2.x - p1.x : p1.x - p2.x,
    h: p2.y > p1.y ? p2.y - p1.y : p1.y - p2.y,
  };
}

export function getPointsDiff(p1: IPoint, p2: IPoint) {
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y,
  };
}
export function applyRectValuesToElement(
  element: HTMLElement | null,
  rect: IRect
) {
  if (!element) return;

  element.style.left = rect.x + "px";
  element.style.top = rect.y + "px";
  element.style.width = rect.w + "px";
  element.style.height = rect.h + "px";
}

export function testIfRectsAreOverlapping(rect1: IRect, rect2: IRect) {
  return !!(
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y > rect2.y + rect2.h &&
    rect1.y + rect1.h < rect2.y
  );
}

export function isIntersectingRect(r1: IRect, r2: IRect) {
  var quickCheck =
    r1.x <= r2.x + r2.w &&
    r2.x <= r1.x + r1.w &&
    r1.y <= r2.y + r2.h &&
    r2.y <= r1.y + r1.h;
  if (quickCheck) return true;
  /* var x_overlap = Math.max(
    0,
    Math.min(r1.x + r1.w, r2.x + r2.w) - Math.max(r1.x, r2.x)
  );
  var y_overlap = Math.max(
    0,
    Math.min(r1.y + r1.h, r2.y + r2.h) - Math.max(r1.y, r2.y)
  );
  var overlapArea = x_overlap * y_overlap;
  return overlapArea == 0;*/
  return false;
}

export function multiplyRect(r: IRect, multiplier: number) {
  return {
    x: r.x * multiplier,
    y: r.y * multiplier,
    w: r.w * multiplier,
    h: r.h * multiplier,
  };
}

export function space2nbsp(str: string | undefined): string {
  if (typeof str === "undefined" || str === null) {
    return "";
  }

  return str.replace(/ /g, "&nbsp;");
}

export function nl2br(str: string | undefined): string {
  if (typeof str === "undefined" || str === null) {
    return "";
  }
  var breakTag = "<br />";
  return (str + "").replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    "$1" + breakTag + "$2"
  );
}

export function roundNumber(num: number, places: number): number {
  return Math.round(num * 10 * places) / (10 * places);
}
