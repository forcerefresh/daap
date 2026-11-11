import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  ActivationParams,
  EditorConfig,
  DeactivationParams,
  IToolClass,
} from "webslider-sdk/lib/objects/i-objects-register";
import { TextValues } from "./text";

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

    textEl.addEventListener("focus", this.inputFocusEventHandlerBind);
    textEl.addEventListener("blur", this.inputBlurEventHandlerBind);

    textEl.addEventListener("input", this.inputChangeEventHandlerBind);

    textEl.focus();

    this.textEl = textEl;

    if (this.objectId) {
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

        textEl.style.whiteSpace = "pre-wrap";
        textEl.style.overflowWrap = "break-word";

        textEl.style.position = "absolute";

        this.editorChange(this.editorConfig);

        textEl.style.display = "inline-block";

        textEl.style.outline = "1px dotted #48aff0";
      }
    }
  }

  private latestValue: string = "";
  inputChangeEventHandler(e: Event) {
    this.latestValue = (e.currentTarget as HTMLElement).innerHTML;
  }

  inputBlurEventHandler(_e: Event) {
    this.requestDeactivation?.();
  }

  inputFocusEventHandler(_e: Event) {
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

  deactivate(_deactivationParams: DeactivationParams) {
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
      this.objectId = undefined;
    }
  }

  toolConfigChange(_toolConfig: unknown) {}

  objectsChange(_objects: IObject[]) {}

  editorChange(editorConfig: EditorConfig) {
    this.editorConfig = { ...this.editorConfig, ...editorConfig };

    if (this.textEl && this.objectId) {
      const transform = this.getObjectTransform(this.objectId, {
        includeTranslate: true,
        skipStageScale: true,
      }).toString();
      this.textEl.style.transform = transform;
      this.textEl.style.transformOrigin = "top left";
    }
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
