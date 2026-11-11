import {
  IMAGE,
  createImageObject,
  getAssetsUrls,
  getImageHtml,
  getImageObjectForm,
  imageMeta,
  imagePostProcess,
  imageSizeUpdate,
  preloadImage,
} from "./image/image";
import { registerObject } from "webslider-sdk/lib/objects/objects-register";
import {
  createSvgMaskObject,
  getSvgMaskAssetsUrls,
  getSvgMaskHtml,
  getSvgMaskObjectForm,
  preloadSvgMaskImage,
  SVG_MASK,
  svgMaskMeta,
  svgMaskPostProcess,
  svgMaskSizeUpdate,
} from "./svg-mask/svg-mask";
import {
  createTextObject,
  getTextHtml,
  preloadText,
  textMeta,
  textSizeUpdate,
  getFonts,
  TEXT,
  getTextObjectForm,
} from "./text/text";
import {
  FREE_DRAW,
  createFreeDrawObject,
  freeDrawMeta,
  freeDrawSizeUpdate,
  getFreeDrawForm,
  getFreeDrawHtml,
} from "./free-draw/free-draw";
import { registerObjectTool } from "./objectToolFactory";
import FreeHandDrawTool from "./free-draw/free-draw-stage-tool";
import TextTool from "./text/text-tool";
import { FreeDrawToolbar } from "./free-draw/FreeDrawToolbar";
import TextToolbar from "./text/TextToolbar";
import TextFloatingToolbar from "./text/TextFloatingBar";
import { ImageToolbar } from "./image/ImageToolbar";
import {
  createRectangleObject,
  getRectangleHtml,
  getRectangleObjectForm,
  RECTANGLE,
  rectangleMeta,
  rectangleSizeUpdate,
} from "./rectangle/rectangle";
import {
  CIRCLE,
  circleMeta,
  circleSizeUpdate,
  createCircleObject,
  getCircleHtml,
  getCircleObjectForm,
} from "./circle/circle";
import {
  createStarObject,
  getStarHtml,
  getStarObjectForm,
  STAR,
  starMeta,
  starSizeUpdate,
} from "./star/star";
import {
  createPolygonObject,
  getPolygonHtml,
  getPolygonObjectForm,
  POLYGON,
  polygonMeta,
  polygonSizeUpdate,
} from "./polygon/polygon";
import {
  createLineObject,
  getLineForm,
  getLineHtml,
  LINE,
  lineMeta,
  linePostProcess,
  lineSizeUpdate,
} from "./line/line";

// -------------------------

registerObject(
  TEXT,
  "1.0.0",
  "text",
  textMeta,
  createTextObject,
  getTextObjectForm,
  textSizeUpdate,
  getTextHtml,
  preloadText,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  getFonts,
);

registerObjectTool({
  type: TEXT,
  meta: textMeta,
  toolClass: TextTool,
  toolBar: TextToolbar as any,
  floatingBar: TextFloatingToolbar as any,
});

registerObjectTool({
  type: "text",
  meta: textMeta,
  toolClass: TextTool,
  toolBar: TextToolbar as any,
  floatingBar: TextFloatingToolbar as any,
});

// -------------------------

registerObject(
  IMAGE,
  "1.0.0",
  "media",
  imageMeta,
  createImageObject,
  getImageObjectForm,
  imageSizeUpdate,
  getImageHtml,
  preloadImage,
  undefined,
  undefined,
  imagePostProcess,
  getAssetsUrls,
);

registerObject(
  SVG_MASK,
  "1.0.0",
  "media",
  svgMaskMeta,
  createSvgMaskObject,
  getSvgMaskObjectForm,
  svgMaskSizeUpdate,
  getSvgMaskHtml,
  preloadSvgMaskImage,
  undefined,
  undefined,
  svgMaskPostProcess,
  getSvgMaskAssetsUrls,
);

registerObjectTool({
  type: IMAGE,
  meta: imageMeta,
  toolBar: ImageToolbar,
});

registerObjectTool({
  type: "image",
  meta: imageMeta,
  toolBar: ImageToolbar,
});

// -------------------------

registerObject(
  FREE_DRAW,
  "1.0.0",
  "media",
  freeDrawMeta,
  createFreeDrawObject,
  getFreeDrawForm,
  freeDrawSizeUpdate,
  getFreeDrawHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObjectTool({
  type: FREE_DRAW,
  meta: freeDrawMeta,
  toolClass: FreeHandDrawTool,
  toolBar: FreeDrawToolbar,
});

registerObjectTool({
  type: "free-draw",
  meta: freeDrawMeta,
  toolClass: FreeHandDrawTool,
  toolBar: FreeDrawToolbar,
});

// -------------------------

registerObject(
  RECTANGLE,
  "1.0.0",
  "media",
  rectangleMeta,
  createRectangleObject,
  getRectangleObjectForm,
  rectangleSizeUpdate,
  getRectangleHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObject(
  CIRCLE,
  "1.0.0",
  "media",
  circleMeta,
  createCircleObject,
  getCircleObjectForm,
  circleSizeUpdate,
  getCircleHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObject(
  STAR,
  "1.0.0",
  "media",
  starMeta,
  createStarObject,
  getStarObjectForm,
  starSizeUpdate,
  getStarHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObject(
  POLYGON,
  "1.0.0",
  "media",
  polygonMeta,
  createPolygonObject,
  getPolygonObjectForm,
  polygonSizeUpdate,
  getPolygonHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObject(
  LINE,
  "1.0.0",
  "media",
  lineMeta,
  createLineObject,
  getLineForm,
  lineSizeUpdate,
  getLineHtml,
  undefined,
  undefined,
  undefined,
  linePostProcess,
  undefined,
);
