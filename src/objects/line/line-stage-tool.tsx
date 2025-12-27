import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  ActivationParams,
  EditorConfig,
  DeactivationParams,
  IToolClass,
} from "../../webslider-sdk/object/i-tool-class";
import { LineValues } from "./line";
import { convertRGBColor2CSSStyle } from "webslider-sdk/lib/utils/utils";
import { truncate } from "fs";
import { getObjectTransform } from "../../panels/stage-panel-new/stage-panel-utils";

type Point = { x: number; y: number };

export const HANDLE_SIZE = 16;

export default class LineStageTool implements IToolClass {
  rootStage: HTMLDivElement | null = null;
  canvas: HTMLDivElement | null = null;
  stageEl: HTMLDivElement | null = null;

  getMousePoint: ActivationParams["getMousePoint"] = () => ({ x: 0, y: 0 });

  getObjectTransform: ActivationParams["getObjectTransform"] = () =>
    new DOMMatrix();

  objectPointToStageSpace: (objectId: string, p: Point) => Point = (
    _objectId,
    p
  ) => p;
  stagePointToObjectSpace: (
    objectId: string,
    p: Point,
    overrideObjectSize?: Pick<IObject, "left" | "top" | "width" | "height">
  ) => Point = (_objectId, p) => p;

  requestObjectUpdate: ActivationParams["requestObjectUpdate"] | null = null;
  requestDeactivation: ActivationParams["requestDeactivation"] | null = null;
  requestObjectDelete: ActivationParams["requestObjectDelete"] | null = null;

  mouseDownHandlerBind: EventListener | undefined;
  mouseMoveHandlerBind: EventListener | undefined;
  mouseUpHandlerBind: EventListener | undefined;
  clickOutsideEventHandlerBind: EventListenerOrEventListenerObject | undefined;

  requestCursorChange: ActivationParams["requestCursorChange"] | null = null;

  getObjects: (type: string) => IObject[] = () => [];
  objects: IObject[] = [];

  isMouseDown: boolean = false;
  activePoint: number | undefined;

  currentPoints: { x: number; y: number }[] = [];
  initialPoint: { x: number; y: number } | null = null;

  editorConfig: EditorConfig = { stageZoom: 1 };
  objectId: string | null = null;

  isEdit: boolean = false;

  private point0: HTMLDivElement | null = null;
  private point1: HTMLDivElement | null = null;
  private object: IObject | null = null;

  private objectValues: LineValues | null = null;
  activate(activationParams: ActivationParams) {
    const {
      object,
      rootStage,
      canvas,
      getMousePoint,
      requestObjectUpdate,
      requestDeactivation,
      requestObjectDelete,
      getObjectTransform,
      objectPointToStageSpace,
      stagePointToObjectSpace,
      editorConfig,
      objectValues,
      objectId,
      position,
      getObjects,
      requestCursorChange,
    } = activationParams;

    this.object = object;
    this.objectValues = objectValues as unknown as LineValues;
    this.objectId = objectId ?? null;
    this.isEdit = !!objectId;
    this.editorConfig = editorConfig;
    this.rootStage = rootStage;

    this.setCanvas(canvas);

    this.getMousePoint = getMousePoint;

    this.getObjectTransform = getObjectTransform;
    this.objectPointToStageSpace = objectPointToStageSpace;
    this.stagePointToObjectSpace = stagePointToObjectSpace;

    this.requestObjectUpdate = requestObjectUpdate;
    this.requestDeactivation = requestDeactivation;
    this.requestObjectDelete = requestObjectDelete;

    this.getObjects = getObjects;

    this.mouseDownHandlerBind = this.mouseDownHandler.bind(this);
    this.mouseMoveHandlerBind = this.mouseMoveHandler.bind(this);
    this.mouseUpHandlerBind = this.mouseUpHandler.bind(this);
    this.clickOutsideEventHandlerBind =
      this.clickOutsideEventHandler.bind(this);

    this.requestCursorChange = requestCursorChange;

    this.rootStage?.addEventListener("mousedown", this.mouseDownHandlerBind!);
    this.rootStage?.addEventListener("mousemove", this.mouseMoveHandlerBind!);
    this.rootStage?.addEventListener("mouseup", this.mouseUpHandlerBind!);
    document.addEventListener("mousedown", this.clickOutsideEventHandlerBind);

    // this.requestCursorChange({
    //   size: 5,
    //   style: { background: "white" },
    // });

    this.currentPoints = [
      { x: object?.x1!, y: object?.y1! },
      { x: object?.x2!, y: object?.y2! },
    ];

    // if (!this.isEdit) {
    //   this.currentPoints = [];
    // }
    this.point0 = this.getPointEl(this.object?.x1!, this.object?.y1!, "1");
    this.point1 = this.getPointEl(this.object?.x2!, this.object?.y2!, "2");

    this.stageEl?.appendChild(this.point0);
    this.stageEl?.appendChild(this.point1);

    this.createPath();

    this.drawPoints();
    this.updateTransform();
    this.editorChange(this.editorConfig);
  }

  deactivate(deactivationParams: DeactivationParams) {
    // if (!deactivationParams.delete && this.currentPoints.length > 0) {
    //   const bounds = getBounds(this.currentPoints);
    //   this.requestObjectUpdate?.({
    //     objectValues: {
    //       points: this.currentPoints.map((p) => ({
    //         x: p.x - bounds.x,
    //         y: p.y - bounds.y,
    //       })),
    //     },
    //     bounds,
    //     isEdit: this.isEdit,
    //     objectId: this.objectId!,
    //   });
    // }

    this.point0?.parentElement?.removeChild(this.point0);
    this.point1?.parentElement?.removeChild(this.point1);

    this.rootStage?.removeEventListener(
      "mousedown",
      this.mouseDownHandlerBind!
    );
    this.rootStage?.removeEventListener(
      "mousemove",
      this.mouseMoveHandlerBind!
    );
    this.rootStage?.removeEventListener("mouseup", this.mouseUpHandlerBind!);
    document.removeEventListener(
      "mousedown",
      this.clickOutsideEventHandlerBind!
    );

    this.unsetCanvas();

    if (this.objectId) {
      // NOTE: show object
      const objectEl = document.getElementsByClassName(
        `object-content-${this.objectId}`
      )[0] as HTMLElement;

      if (objectEl) objectEl.style.display = "block";

      this.objectId = null;
    }
  }

  toolConfigChange(toolConfig: unknown) {
    // this.toolConfig = {
    //   ...this.toolConfig,
    //   ...(toolConfig as IFreeDrawToolConfig),
    // };
    // this.requestCursorChange?.({
    //   size: parseInt(this.toolConfig.strokeWidth),
    //   style: {
    //     background: convertRGBColor2CSSStyle(this.toolConfig.color)
    //       .backgroundColor,
    //   },
    // });
  }

  objectsChange(objects: IObject[]) {
    this.objects = objects;
  }

  editorChange(editorConfig: EditorConfig) {
    this.editorConfig = editorConfig;

    if (!this.svgEl) return;

    this.currentPathEl?.setAttribute(
      "stroke-width",
      1 / this.editorConfig.stageZoom + ""
    );
    // this.editorConfig = { ...this.editorConfig, ...editorConfig };
    // const svgArr = this.canvas!.querySelectorAll("svg");
    // svgArr.forEach((svg) => {
    //   // svg.style.transform = "scale(" + this.editorConfig.stageZoom + ")";
    //   svg.style.margin = `1px 0px 0px 1px`;
    // });

    this.drawPoints();
    this.updateTransform();
    this.updateHandle(this.point0, this.object?.x1!, this.object?.y1!);
    this.updateHandle(this.point1, this.object?.x2!, this.object?.y2!);
  }

  private updateTransform() {
    if (!this.svgEl || !this.svgPreviewEl) return;

    const bounds = getBounds(this.currentPoints);

    const transform = this.getObjectTransform(
      this.objectId!,
      {
        includeTranslate: true,
        skipStageScale: true,
      }
      // {
      //   [this.objectId!]: {
      //     left: bounds.x,
      //     top: bounds.y,
      //     width: bounds.width,
      //     height: bounds.height,
      //   },
      // }
    ).toString();

    //- b.x;

    // this.svgEl.style.left = this.object.left + "px";
    // this.svgEl.style.top = this.object.top + "px";

    // this.svgPreviewEl.style.left = this.object.left + "px";
    // this.svgPreviewEl.style.top = this.object.top + "px";

    this.svgEl.style.transform = transform;
    this.svgPreviewEl.style.transform = transform;

    // this.svgEl.style.transformOrigin = "top left";

    ////////
  }

  private latestPoint = { x: 0, y: 0 };

  private latestBounds: any;
  private mouseDownHandler(evt: Event) {
    const e = evt as MouseEvent;

    const point = (e.target as HTMLElement).getAttribute("data-point");
    if (!point) {
      this.requestDeactivation?.();
      return;
    }

    this.latestBounds = getBounds(this.currentPoints);

    e.stopPropagation();
    this.isMouseDown = true;
    this.activePoint = point === "1" ? 0 : 1;
    this.initialPoint = this.getMousePoint(e);

    return;

    e.stopPropagation();

    const { x, y } = this.getMousePoint(e);
    this.createPath();
    this.currentPoints.push({ x, y });
  }

  private mouseMoveHandler(evt: Event) {
    if (!this.isMouseDown) return;

    const e = evt as MouseEvent;
    e.stopPropagation();

    let latestB = this.latestBounds; //getBounds(this.currentPoints);
    const b = getBounds(this.currentPoints);

    const boundsDiff = { x: -latestB.x + b.x, y: -latestB.y + b.y };

    const { x, y } = this.getMousePoint(e);

    const p = this.stagePointToObjectSpace(this.objectId!, { x, y });

    const X = p.x + latestB.x!;
    const Y = p.y + latestB.y!;

    this.updateHandle(this["point" + this.activePoint], p.x + b.x!, p.y + b.y!);

    // OVDE 1
    // const p1 = this.stagePointToObjectSpace(this.objectId!, { x, y });

    // const diff = {
    //   x:
    //   y:
    // }
    // this.initialPoint = { x, y };

    // let b3 = getBounds(this.currentPoints);
    // this.currentPoints[this.activePoint!] = { x: X, y: Y };

    this.currentPoints[this.activePoint!] = {
      x: X, //- boundsDiff.x,
      y: Y, //- boundsDiff.y,
    };
    this.drawPoints();

    // this.updateTransform();
  }

  private mouseUpHandler(evt: Event) {
    if (!this.isMouseDown) return;
    evt.stopPropagation();

    this.isMouseDown = false;

    const lB = this.latestBounds;
    const bOriginal = getBounds(this.currentPoints);

    // const diffX = b.x - lB.x;
    // const diffY = b.y - lB.y;

    const transform = getObjectTransform(this.object);
    const m = new DOMMatrix(transform);
    const bTran = m.transformPoint({ x: bOriginal.x, y: bOriginal.y });

    const points = {
      x1: this.currentPoints[0].x - bOriginal.x, // + diffX,
      y1: this.currentPoints[0].y - bOriginal.y, //+ diffY,
      x2: this.currentPoints[1].x - bOriginal.x, //+ diffX,
      y2: this.currentPoints[1].y - bOriginal.y, // + diffY,
    };

    this.requestObjectUpdate?.({
      points,
      bounds: {
        x: this.object.left + bTran.x,
        y: this.object.top + bTran.y,
        width: bOriginal.width,
        height: bOriginal.height,
      },
      isEdit: this.isEdit,
      objectId: this.objectId!,
      // reactivate: true,
    });

    this.object!.x1 = points.x1;
    this.object!.y1 = points.y1;
    this.object!.x2 = points.x2;
    this.object!.y2 = points.y2;

    return;

    this.isMouseDown = false;

    this.initialPoint = null;

    const e = evt as MouseEvent;

    const { x, y } = this.getMousePoint(e);

    this.currentPoints.push({ x, y });

    // const bounds = getBounds(this.currentPoints);
    // this.requestObjectUpdate?.({
    //   objectValues: {
    //     points: this.currentPoints.map((p) => ({
    //       x: p.x - bounds.x,
    //       y: p.y - bounds.y,
    //     })),
    //   },
    //   bounds,
    //   isEdit: this.isEdit,
    //   objectId: this.objectId!,
    // });

    // const svgEl = this.canvas!.getElementsByTagName("svg")[0] as
    //   | SVGElement
    //   | undefined;

    // if (svgEl) svgEl.parentElement!.removeChild(svgEl);

    // this.currentPoints = [];
    // this.currentPoint = null;

    // this.requestDeactivation?.();
  }

  currentPathEl: SVGPathElement | null = null;
  currentPathPreviewEl: SVGPathElement | null = null;
  svgEl: SVGElement | null = null;
  svgPreviewEl: SVGElement | null = null;

  private createPath(toolConfig?: any /*IFreeDrawToolConfig */) {
    if (!this.svgEl) {
      let svgElPreview = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgElPreview.style.overflow = "visible";
      svgElPreview.style.position = "absolute";

      this.stageEl?.appendChild(svgElPreview);
      svgElPreview.style.transformOrigin = "left top";
      // svgEl.style.margin = `1px 0px 0px 1px`;
      this.svgPreviewEl = svgElPreview;

      ////
      let svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgEl.style.overflow = "visible";
      svgEl.style.position = "absolute";

      this.stageEl?.appendChild(svgEl);
      svgEl.style.transformOrigin = "left top";
      // svgEl.style.margin = `1px 0px 0px 1px`;
      this.svgEl = svgEl;
    }

    ///// ----

    const pathEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathEl.setAttribute("fill", "none");
    // pathEl.setAttribute("stroke-linejoin", this.objectValues?.strokeLineJoin!);
    pathEl.setAttribute("stroke-linecap", this.objectValues?.strokeLineCap!);
    pathEl.setAttribute(
      "stroke-width",
      1 * this.editorConfig.stageZoom + ""
      // config.strokeWidth //* this.options.stageZoom + ""
    );
    pathEl.setAttribute(
      "fill",
      "none"
      //convertRGBColor2CSSStyle(config.color).backgroundColor ?? ""
    );
    pathEl.setAttribute(
      "stroke",
      "rgba(72, 175,240, 1)"
      //convertRGBColor2CSSStyle(config.color).backgroundColor ?? ""
    );

    this.currentPathEl = pathEl;
    this.svgEl!.appendChild(pathEl);

    ////// -----

    const previewPathEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    previewPathEl.setAttribute("fill", "none");
    // previewPathEl.setAttribute(
    //   "stroke-linejoin",
    //   this.objectValues?.strokeLineJoin!
    // );
    previewPathEl.setAttribute(
      "stroke-linecap",
      this.objectValues?.strokeLineCap!
    );
    previewPathEl.setAttribute("stroke-width", this.objectValues?.strokeWidth!);
    previewPathEl.setAttribute(
      "fill",

      convertRGBColor2CSSStyle(this.objectValues?.fillColor).backgroundColor ??
        ""
      //convertRGBColor2CSSStyle(config.color).backgroundColor ?? ""
    );
    previewPathEl.setAttribute(
      "stroke",
      convertRGBColor2CSSStyle(this.objectValues?.strokeColor)
        .backgroundColor ?? ""
      // this.objectValues?.strokeWidth
      //convertRGBColor2CSSStyle(config.color).backgroundColor ?? ""
    );

    this.currentPathPreviewEl = previewPathEl;
    this.svgPreviewEl!.appendChild(previewPathEl);
  }

  private redraw() {
    // let svgEl = this.canvas!.getElementsByTagName("svg")[0];
    // if (svgEl) svgEl.innerHTML = "";
    // this.stack.forEach((stackItem) => {
    //   const pathEl = this.createPath(stackItem.toolConfig);
    //   this.drawPoints(pathEl, stackItem.points);
    // });
  }

  private drawPoints() {
    // const b = getBounds(this.currentPoints);
    // const b = this.latestBounds ?? getBounds(this.currentPoints);

    const path =
      "M" +
      this.currentPoints
        .map((p) => {
          const X = p.x; //+ this.object.left; //- b.x;
          const Y = p.y; //+ this.object.top; // - b.y;

          return X + " " + Y;
        })
        .join(" ");
    this.currentPathEl?.setAttribute("d", path);
    this.currentPathPreviewEl?.setAttribute("d", path);
  }

  private setCanvas(canvas: HTMLDivElement) {
    this.canvas = canvas;
    this.canvas.style.display = "block";
    // this.canvas.style.background = "rgba(34,56,1,0.2)";

    // this.canvas.style.cursor = "crosshair";

    this.stageEl = this.canvas.getElementsByClassName(
      "MainToolStage"
    )[0] as HTMLDivElement;
  }

  private unsetCanvas() {
    if (this.canvas) {
      this.svgEl?.parentElement!.removeChild(this.svgEl);
      this.svgPreviewEl?.parentElement!.removeChild(this.svgPreviewEl);

      //this.canvas.style.cursor = "default";
      this.canvas.style.display = "none";
      this.canvas.style.background = "";
      this.canvas = null;
    }
  }

  private clickOutsideEventHandler(e: Event) {
    // if ((e?.target as Element)?.closest(".color-picker-holder")) {
    //   return;
    // }

    // if (
    //   document
    //     .getElementsByClassName("layers-simplified-panel")[0]
    //     ?.contains(e?.target as Node)
    // ) {
    //   this.requestDeactivation?.();
    // }

    const el = document.getElementsByClassName("layout-center-area")[0];
    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains((e?.target as Node) || null)) {
      return;
    }

    this.requestDeactivation?.();
  }

  updateHandle(el: any, x: number, y: number) {
    const b = getBounds(this.currentPoints);
    const stageSpacePoint = this.objectPointToStageSpace(this.objectId!, {
      x: x - b.x!,
      y: y - b.y!,
    });

    const scaledHandleSize = HANDLE_SIZE / this.editorConfig.stageZoom;

    el.style.left = stageSpacePoint.x - scaledHandleSize / 2 + "px";
    el.style.top = stageSpacePoint.y - scaledHandleSize / 2 + "px";
    el.style.width = scaledHandleSize + "px";
    el.style.height = scaledHandleSize + "px";

    const borderRadius = "10%"; //  2 / Math.abs(initialScale) / stageZoom;
    const groupSelectionColor = "#48aff0"; /// "#48f08d";
    const objectSelectionColor = "#48aff0";
    el.style.background = `${
      this.object?.objectIds ? groupSelectionColor : objectSelectionColor
    }`;
    const handleBoxShadow =
      "0 0 0 " +
      1 / Math.abs(this.object?.scale ?? 1) / this.editorConfig.stageZoom +
      "px white";

    el.style.boxShadow = handleBoxShadow;
    el.style.borderRadius = borderRadius;
  }
  private getPointEl(x: number, y: number, pointIdx: string) {
    // stageSpacePoint.x += b.x;
    // stageSpacePoint.y += b.y;

    const el = document.createElement("div");
    this.updateHandle(el, x, y);

    el.style.transformOrigin = "center center";
    el.setAttribute("data-point", pointIdx);
    // el.style.transform = `scale(${1 / object.scale! / stageZoom})`;

    // el.style.transform = "scale(" + stageZoom + ")";

    // el.style.border = `0.1px solid ${
    //   object.objectIds ? groupSelectionColor : objectSelectionColor
    // }`;
    el.style.position = "absolute";
    el.style.zIndex = "100";

    el.style.pointerEvents = "all";
    el.setAttribute("data-scale-handle", "p1");
    el.setAttribute(
      "class",
      "move-dot-handle move-dot-handle-" + this.object?.id
    );

    // el.addEventListener("mousedown", handleMouseDown);
    return el;
  }
}

function getBounds(points: { x: number; y: number }[]) {
  let hMin = 100000;
  let hMax = -100000;
  let vMin = 100000;
  let vMax = -100000;

  points.forEach((p) => {
    hMin = Math.min(hMin, p.x);
    hMax = Math.max(hMax, p.x);
    vMin = Math.min(vMin, p.y);
    vMax = Math.max(vMax, p.y);
  });

  return {
    x: hMin,
    width: hMax - hMin,
    y: vMin,
    height: vMax - vMin,
  };
}
