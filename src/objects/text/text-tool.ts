import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  ActivationParams,
  EditorConfig,
  DeactivationParams,
  IToolClass,
  Point,
} from "../../webslider-sdk/object/i-tool-class";
import { TextValues } from "./text";
import { populateObjectThreeIds } from "../../store/actions/actions-utils";
import { getGroupMatrixFromSelectionPath } from "../../panels/stage-panel-new/stage-panel-utils";

export const getCursorStyle = () => {
  return `text`;
};

export default class TextTool implements IToolClass {
  canvas: HTMLDivElement | null = null;
  stageEl: HTMLDivElement | null = null;
  getMousePoint: ActivationParams["getMousePoint"] = () => ({ x: 0, y: 0 });

  getObjectTransform: ActivationParams["getObjectTransform"] = () =>
    new DOMMatrix();

  requestObjectUpdate: ActivationParams["requestObjectUpdate"] | null = null;
  requestDeactivation: ActivationParams["requestDeactivation"] | null = null;
  requestObjectDelete: ActivationParams["requestObjectDelete"] | null = null;

  clickOutsideEventHandlerBind: EventListenerOrEventListenerObject | undefined;
  inputChangeEventHandlerBind: EventListenerOrEventListenerObject | undefined;
  inputFocusEventHandlerBind: EventListenerOrEventListenerObject | undefined;
  inputBlurEventHandlerBind: EventListenerOrEventListenerObject | undefined;

  isMouseDown: boolean = false;

  editorConfig: EditorConfig = { stageZoom: 1 };
  objectId: string | undefined;

  isEdit: boolean = false;

  textEl: HTMLDivElement | undefined;
  object?: IObject | null;

  activate(activationParams: ActivationParams) {
    const {
      canvas,
      getMousePoint,
      getObjectTransform,
      requestObjectUpdate,
      requestDeactivation,
      requestObjectDelete,
      editorConfig,
      objectValues,
      objectId,
      object,
    } = activationParams;

    this.object = object;
    this.objectId = objectId;
    this.isEdit = !!objectId;

    this.setCanvas(canvas);

    this.getMousePoint = getMousePoint;
    this.getObjectTransform = getObjectTransform;
    this.requestObjectUpdate = requestObjectUpdate;
    this.requestDeactivation = requestDeactivation;
    this.requestObjectDelete = requestObjectDelete;
    this.editorConfig = editorConfig;
    this.objectId = objectId;

    this.clickOutsideEventHandlerBind =
      this.clickOutsideEventHandler.bind(this);

    this.inputChangeEventHandlerBind = this.inputChangeEventHandler.bind(this);
    this.inputFocusEventHandlerBind = this.inputFocusEventHandler.bind(this);
    this.inputBlurEventHandlerBind = this.inputBlurEventHandler.bind(this);

    document.addEventListener("mousedown", this.clickOutsideEventHandlerBind);

    const textObjectValue = objectValues as unknown as TextValues;

    // set initial value
    this.latestValue = textObjectValue.text;

    const textEl = document.createElement("div");

    textEl.innerHTML = textObjectValue.text;
    textEl.contentEditable = "plaintext-only";
    this.stageEl?.appendChild(textEl);

    // textEl.onfocus = function () {
    //   window.setTimeout(function () {
    //     var sel, range;
    //     if (window.getSelection && document.createRange) {
    //       range = document.createRange();
    //       range.selectNodeContents(textEl);
    //       sel = window.getSelection();
    //       sel?.removeAllRanges();
    //       sel?.addRange(range);
    //     }
    //     textEl.onfocus = () => {};
    //   }, 1);
    // };

    textEl.addEventListener("focus", this.inputFocusEventHandlerBind);
    textEl.addEventListener("blur", this.inputBlurEventHandlerBind);

    textEl.addEventListener("input", this.inputChangeEventHandlerBind);

    textEl.focus();

    this.textEl = textEl;
    // textEl.onblur = function () {
    //     this.upda
    // }

    if (this.objectId) {
      // NOTE: show object
      const objectEl = document.getElementsByClassName(
        `object-content-${this.objectId}`
      )[0] as HTMLElement;

      if (objectEl) {
        textEl.style.transformOrigin = objectEl.style.transformOrigin;
        textEl.style.fontFamily = objectEl.style.fontFamily;
        textEl.style.fontSize = objectEl.style.fontSize;
        textEl.style.color = objectEl.style.color;
        textEl.style.fontWeight = objectEl.style.fontWeight;
        textEl.style.width = objectEl.style.width;
        textEl.style.height = "auto"; //objectEl.style.height;
        textEl.style.fontKerning = objectEl.style.fontKerning;
        textEl.style.textAlign = objectEl.style.textAlign;
        textEl.style.margin = objectEl.style.margin;

        //objectEl.style.display = "none";
        textEl.style.whiteSpace = "pre-wrap";
        textEl.style.overflowWrap = "break-word";

        textEl.style.position = "absolute";

        this.editorChange(this.editorConfig);

        textEl.style.display = "inline-block";

        textEl.style.outline = "1px dotted #48aff0";
        //textEl.style.border = "1px dotted #48aff0";
      }
    }
  }

  private latestValue: string = "";
  inputChangeEventHandler(e: Event) {
    this.latestValue = (e.currentTarget as HTMLElement).innerHTML;
    // this.requestObjectUpdate?.({
    //   objectValues: { text: this.latestValue },
    //   isEdit: true,
    //   objectId: this.objectId,
    // });
  }

  inputBlurEventHandler(e: Event) {
    this.requestDeactivation?.();
  }

  inputFocusEventHandler(e: Event) {
    window.setTimeout(() => {
      var sel, range;
      if (window.getSelection && document.createRange && this.textEl) {
        range = document.createRange();
        range.selectNodeContents(this.textEl);
        sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      this.textEl?.removeEventListener(
        "focus",
        this.inputFocusEventHandlerBind!
      );
    }, 1);
  }

  deactivate(deactivationParams: DeactivationParams) {
    // if (!deactivationParams.delete && this.stack.length > 0) {
    //   const objProps = this.convertStackToPoints();
    //   this.requestObjectUpdate?.({
    //     objectValues: { lines: objProps.lines },
    //     bounds: objProps.bounds,
    //     isEdit: this.isEdit,
    //     objectId: this.objectId!,
    //   });
    // }

    this.requestObjectUpdate?.({
      objectValues: { text: this.latestValue },
      isEdit: true,
      objectId: this.objectId,
    });

    document.removeEventListener(
      "mousedown",
      this.clickOutsideEventHandlerBind!
    );

    this.textEl?.removeEventListener(
      "input",
      this.inputChangeEventHandlerBind!
    );

    this.textEl!.parentElement?.removeChild(this.textEl!);

    this.unsetCanvas();

    if (this.objectId) {
      // NOTE: show object
      const objectEl = document.getElementsByClassName(
        `object-content-${this.objectId}`
      )[0] as HTMLElement;

      // if (objectEl) objectEl.style.display = "block";

      this.objectId = undefined;
    }
  }

  toolConfigChange(toolConfig: unknown) {
    //   this.toolConfig = {
    //     ...this.toolConfig,
    //     ...(toolConfig as IFreeDrawToolConfig),
    //   };
  }

  objectsChange(objects: IObject[]) {
    //this.objects = objects;
  }

  editorChange(editorConfig: EditorConfig) {
    this.editorConfig = { ...this.editorConfig, ...editorConfig };

    // this.textEl!.style.left =
    //   this.editorConfig.stageZoom *
    //     parseFloat(this.object?.absoluteLayout?.common.left!) +
    //   "px";
    // this.textEl!.style.top =
    //   this.editorConfig.stageZoom *
    //     parseFloat(this.object?.absoluteLayout?.common.top!) +
    //   "px";

    if (this.textEl && this.objectId) {
      const transform = this.getObjectTransform(this.objectId, {
        includeTranslate: true,
        skipStageScale: true,
      }).toString();
      this.textEl.style.transform = transform;
      this.textEl.style.transformOrigin = "top left";

      // this.textEl.style.transform =
      //   "scale(" + this.editorConfig.stageZoom + ")";
      // this.textEl.style.transformOrigin = "top left";
    }
    // const svgArr = this.canvas!.querySelectorAll("svg");
    // svgArr.forEach((svg) => {
    //   svg.style.transform = "scale(" + this.editorConfig.stageZoom + ")";
    //   svg.style.margin = `1px 0px 0px 1px`;
    // });
  }

  private setCanvas(canvas: HTMLDivElement) {
    this.canvas = canvas;
    this.canvas.style.display = "block";
    this.canvas.style.background = "rgba(34,56,1,0,2)";

    this.canvas.style.cursor = getCursorStyle();

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

      this.canvas.style.cursor = "default";
      this.canvas.style.display = "none";
      this.canvas.style.background = "";
      this.canvas = null;
    }
  }

  private clickOutsideEventHandler(e: Event) {
    e.stopPropagation();

    const el = document.getElementsByClassName("layout-center-area")[0];
    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains((e?.target as Node) || null)) {
      return;
    }

    this.requestDeactivation?.();
  }
}
