import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  ActivationParams,
  EditorConfig,
  DeactivationParams,
  IToolClass,
  Point,
} from "../../webslider-sdk/object/i-tool-class";
import { FreeDrawValues } from "./free-draw";
import { IBezier, IFreeDrawToolConfig, Points } from "./types";
import { bezierArr2Path, bezierToFixed, lineIntersection } from "./utils";
import { ICursorStyle } from "../../panels/stage-panel-new/CursorProvider";
import { convertRGBColor2CSSStyle } from "webslider-sdk/lib/utils/utils";
var fitCurve = require("fit-curve");
var error = 1;

export const getCursorStyle = () => {
  return ""; // `crosshair`;
};

export default class FreeHandDrawTool implements IToolClass {
  rootStage: HTMLDivElement | null = null;
  canvas: HTMLDivElement | null = null;
  stageEl: HTMLDivElement | null = null;
  getMousePoint: ActivationParams["getMousePoint"] = () => ({ x: 0, y: 0 });

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
  currentPoints: Points = [];
  stack: {
    points: Points;
    toolConfig: IFreeDrawToolConfig;
    options: EditorConfig;
  }[] = [];

  toolConfig: IFreeDrawToolConfig = {
    color: { r: 255, g: 255, b: 255, a: 1 },
    strokeWidth: "5",
    eraser: false,
  };
  editorConfig: EditorConfig = { stageZoom: 1 };
  objectId: string | null = null;

  isEdit: boolean = false;

  activate(activationParams: ActivationParams) {
    const {
      rootStage,
      canvas,
      getMousePoint,
      requestObjectUpdate,
      requestDeactivation,
      requestObjectDelete,
      editorConfig,
      objectValues,
      objectId,
      position,
      getObjects,
      requestCursorChange,
    } = activationParams;

    this.objectId = objectId ?? null;
    this.isEdit = !!objectId;

    this.stack = [];

    this.rootStage = rootStage;
    this.setCanvas(canvas);

    this.getMousePoint = getMousePoint;
    this.requestObjectUpdate = requestObjectUpdate;
    this.requestDeactivation = requestDeactivation;
    this.requestObjectDelete = requestObjectDelete;
    this.editorConfig = editorConfig;
    this.objectId = objectId ?? null;
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

    this.requestCursorChange({
      size: 5,
      style: { background: "white" },
    });

    // if (objectValues) {
    //   this.stack = (objectValues as unknown as FreeDrawValues).lines.map(
    //     (line) => {
    //       const points: Points = line.points.map((p) => {
    //         return [p[0] + position.x, p[1] + position.y];
    //       });

    //       return {
    //         points,
    //         toolConfig: {
    //           color: line.color,
    //           strokeWidth: line.strokeWidth,
    //           eraser: false,
    //         },
    //         options: { stageZoom: 1 },
    //       };
    //     }
    //   );

    //   this.redraw();

    //   // hide object
    //   const objectEl = document.getElementsByClassName(
    //     `object-content-${this.objectId}`
    //   )[0] as HTMLElement;

    //   if (objectEl) objectEl.style.display = "none";

    //   return;
    // }
  }

  deactivate(deactivationParams: DeactivationParams) {
    if (!deactivationParams.delete && this.stack.length > 0) {
      const objProps = this.convertStackToPoints();
      this.requestObjectUpdate?.({
        objectValues: {
          lines: objProps.lines,
          color: objProps.color,
          strokeWidth: objProps.strokeWidth,
        },
        bounds: objProps.bounds,
        isEdit: this.isEdit,
        objectId: this.objectId!,
      });
    }

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
    this.toolConfig = {
      ...this.toolConfig,
      ...(toolConfig as IFreeDrawToolConfig),
    };

    this.requestCursorChange?.({
      size: parseInt(this.toolConfig.strokeWidth),
      style: {
        background: convertRGBColor2CSSStyle(this.toolConfig.color)
          .backgroundColor,
      },
    });
  }

  objectsChange(objects: IObject[]) {
    this.objects = objects;
  }

  editorChange(editorConfig: EditorConfig) {
    this.editorConfig = { ...this.editorConfig, ...editorConfig };

    const svgArr = this.canvas!.querySelectorAll("svg");

    svgArr.forEach((svg) => {
      // svg.style.transform = "scale(" + this.editorConfig.stageZoom + ")";
      svg.style.margin = `1px 0px 0px 1px`;
    });
  }

  private convertStackToPoints() {
    const minPos = { x: 100000, y: 100000 };
    const maxPos = { x: -100000, y: -100000 };

    this.stack.forEach((stackItem) => {
      const points = stackItem.points.map((p) => {
        minPos.x = Math.min(minPos.x, p[0]);
        minPos.y = Math.min(minPos.y, p[1]);
        maxPos.x = Math.max(maxPos.x, p[0]);
        maxPos.y = Math.max(maxPos.y, p[1]);
      });

      return {
        ...stackItem,
        points,
      };
    });

    const normalizedStack = this.stack.map((stackItem) => {
      const points = stackItem.points.map((p) => {
        return [p[0] - minPos.x, p[1] - minPos.y];
      });

      return {
        ...stackItem,
        points,
      };
    });

    const normalizedBezier = normalizedStack.map((stackItem) => {
      let bezier: IBezier[] = fitCurve(stackItem.points, error);
      bezier = bezierToFixed(bezier);
      return {
        bezier,
        // points: stackItem.points,
        color: stackItem.toolConfig.color,
        strokeWidth: stackItem.toolConfig.strokeWidth,
      };
    });

    return {
      lines: normalizedBezier,
      bounds: {
        x: minPos.x,
        y: minPos.y,
        width: maxPos.x - minPos.x,
        height: maxPos.y - minPos.y,
      },
      color: normalizedBezier[0].color,
      strokeWidth: normalizedBezier[0].strokeWidth,
    };
  }

  private latestPoint = { x: 0, y: 0 };
  private mouseDownHandler(evt: Event) {
    const e = evt as MouseEvent;
    e.stopPropagation();

    this.isMouseDown = true;

    if (this.toolConfig.eraser) {
      this.latestPoint = this.getMousePoint(e);
      return;
    }

    this.currentPoints = [];

    const { x, y } = this.getMousePoint(e);
    this.createPath();
    this.currentPoints.push([x, y]);
  }

  private mouseMoveHandler(evt: Event) {
    if (!this.isMouseDown) return;

    const e = evt as MouseEvent;

    if (this.toolConfig.eraser) {
      const { x, y } = this.getMousePoint(e);

      const isRemoved = this.removeIntersection(this.latestPoint, { x, y });
      if (isRemoved) this.redraw();

      this.latestPoint = { x, y };
      return;
    }

    const { x, y } = this.getMousePoint(e);

    this.currentPoints.push([x, y]);

    this.drawPoints();
  }

  private mouseUpHandler(evt: Event) {
    this.isMouseDown = false;

    if (this.toolConfig.eraser) {
      return;
    }

    const e = evt as MouseEvent;

    const { x, y } = this.getMousePoint(e);

    this.currentPoints.push([x, y]);
    this.stack.push({
      points: this.currentPoints,
      options: { ...this.editorConfig },
      toolConfig: { ...this.toolConfig },
    });

    // TODO: NEW FOR INDIVIDUAL >>>
    const objProps = this.convertStackToPoints();
    this.requestObjectUpdate?.({
      objectValues: {
        lines: objProps.lines,
        color: objProps.color,
        strokeWidth: objProps.strokeWidth,
      },
      bounds: objProps.bounds,
      isEdit: false, // this.isEdit,
      // objectId: this.objectId!,
    });

    const svgEl = this.canvas!.getElementsByTagName("svg")[0] as
      | SVGElement
      | undefined;

    if (svgEl) svgEl.parentElement!.removeChild(svgEl);

    this.stack = [];
  }

  // OTHER

  removeIntersection(p1: Point, p2: Point) {
    this.objects.forEach((obj: IObject) => {
      const lines = (obj.properties as FreeDrawValues).lines;

      // const pomX = parseInt(obj.absoluteLayout?.common.left!);
      // const pomY = parseInt(obj.absoluteLayout?.common.top!);
      // NOTE: LAYOUT CHANGE

      const pomX = obj.left!;
      const pomY = obj.top!;

      let removed = false;
      lines.forEach((line) => {
        for (let i = 1; i < line.points.length; i++) {
          const lp1 = {
            x: line.points[i - 1][0] + pomX,
            y: line.points[i - 1][1] + pomY,
          };
          const lp2 = {
            x: line.points[i][0] + pomX,
            y: line.points[i][1] + pomY,
          };
          if (
            lineIntersection(p1.x, p1.y, p2.x, p2.y, lp1.x, lp1.y, lp2.x, lp2.y)
          ) {
            removed = true;
          }
        }
      });

      if (removed && !obj.isLocked) {
        this.requestObjectDelete?.(obj.id);
      }
    });

    let removed = false;

    this.stack = this.stack
      .map((stackItem) => {
        for (let i = 1; i < stackItem.points.length; i++) {
          const lp1 = {
            x: stackItem.points[i - 1][0],
            y: stackItem.points[i - 1][1],
          };
          const lp2 = { x: stackItem.points[i][0], y: stackItem.points[i][1] };
          if (
            lineIntersection(p1.x, p1.y, p2.x, p2.y, lp1.x, lp1.y, lp2.x, lp2.y)
          ) {
            removed = true;
            return null as any;
          }
        }
        return stackItem;
      })
      .filter((item) => item !== null);

    return removed;
  }

  currentPathEl: SVGPathElement | null = null;
  private createPath(toolConfig?: IFreeDrawToolConfig) {
    const config = toolConfig ? toolConfig : this.toolConfig;
    let svgEl = this.stageEl?.getElementsByTagName("svg")[0] as
      | SVGElement
      | undefined;
    if (!svgEl) {
      svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgEl.style.overflow = "visible";

      this.stageEl?.appendChild(svgEl);
      // svgEl.style.transform = "scale(" + this.editorConfig.stageZoom + ")";
      svgEl.style.transformOrigin = "left top";
      svgEl.style.margin = `1px 0px 0px 1px`;
    }

    const pathEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke-linejoin", "round");
    pathEl.setAttribute("stroke-linecap", "round");
    pathEl.setAttribute(
      "stroke-width",
      config.strokeWidth //* this.options.stageZoom + ""
    );
    pathEl.setAttribute(
      "color",
      convertRGBColor2CSSStyle(config.color).backgroundColor ?? ""
    );
    pathEl.setAttribute(
      "stroke",
      convertRGBColor2CSSStyle(config.color).backgroundColor ?? ""
    );

    this.currentPathEl = pathEl;
    svgEl.appendChild(pathEl);

    return pathEl;
  }

  private redraw() {
    let svgEl = this.canvas!.getElementsByTagName("svg")[0];
    if (svgEl) svgEl.innerHTML = "";

    this.stack.forEach((stackItem) => {
      const pathEl = this.createPath(stackItem.toolConfig);
      this.drawPoints(pathEl, stackItem.points);
    });
  }

  private drawPoints(pathEl?: SVGPathElement, currentPoints?: Points) {
    const points = currentPoints ? currentPoints : this.currentPoints;

    const el = pathEl ? pathEl : this.currentPathEl!;

    let bezierCurves = fitCurve(points, error);
    bezierCurves = bezierToFixed(bezierCurves);

    const path = bezierArr2Path(bezierCurves);
    el.setAttribute("d", path);
  }

  private setCanvas(canvas: HTMLDivElement) {
    this.canvas = canvas;
    this.canvas.style.display = "block";
    this.canvas.style.background = "rgba(34,56,1,0,2)";

    //this.canvas.style.cursor = "crosshair";

    this.stageEl = this.canvas.getElementsByClassName(
      "MainToolStage"
    )[0] as HTMLDivElement;
  }

  private unsetCanvas() {
    if (this.canvas) {
      const svgEl = this.stageEl?.getElementsByTagName("svg")[0] as
        | SVGElement
        | undefined;

      if (svgEl) svgEl.parentElement!.removeChild(svgEl);

      //this.canvas.style.cursor = "default";
      this.canvas.style.display = "none";
      this.canvas.style.background = "";
      this.canvas = null;
    }
  }

  private clickOutsideEventHandler(e: Event) {
    if ((e?.target as Element)?.closest(".color-picker-holder")) {
      return;
    }

    if (
      document
        .getElementsByClassName("layers-simplified-panel")[0]
        ?.contains(e?.target as Node)
    ) {
      this.requestDeactivation?.();
    }

    const el = document.getElementsByClassName("layout-center-area")[0];
    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains((e?.target as Node) || null)) {
      return;
    }

    this.requestDeactivation?.();
  }
}
