import { Button } from "@blueprintjs/core";
import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ShapePreviewPanel.module.scss";
import { addNewObject, replaceObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getObjectHtml } from "../../export/export-html";
import {
  createRectangleObject,
  getRectangleHtml,
  RECTANGLE,
  RectangleValues,
} from "../../objects/rectangle/rectangle";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import {
  CIRCLE,
  CircleValues,
  createCircleObject,
  getCircleHtml,
} from "../../objects/circle/circle";
import { createStarObject, getStarHtml, STAR } from "../../objects/star/star";
import { getPolygonHtml, POLYGON } from "../../objects/polygon/polygon";
import {
  createLineObject,
  getLineHtml,
  LINE,
  LineValues,
} from "../../objects/line/line";
import { GlobalEventsContext } from "../../utils/global-events/GlobalEvents";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";

enum ShapeSections {
  Line = "line",
  Rectangle = "rectangle",
  Circle = "circle",
  Polygon = "polygon",
  Star = "star",
  Other = "other",
}

interface IShapePreviewPanelProps {
  onRequestClose: () => void;
  editObjectId?: string;
}

export type IShapePreviewPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IShapePreviewPanelProps;

const ShapePreviewPanel: React.FC<IShapePreviewPanelMergedProps> = (props) => {
  const {
    themeClass,
    _addNewObject,
    activeLayerId,
    onRequestClose,
    _replaceObject,
  } = props;

  const { replaceItem } = useContext(GlobalEventsContext);

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [ShapeSections.Line]: true,
    [ShapeSections.Rectangle]: true,
    [ShapeSections.Circle]: true,
    [ShapeSections.Other]: true,
    [ShapeSections.Polygon]: true,
    [ShapeSections.Star]: true,
  });

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  const [rectObjectsHtml, setRectObjectsHtml] = useState<
    {
      html: string;
      properties: RectangleValues;
      object: Partial<IObject>;
    }[]
  >([]);

  const [circleObjectsHtml, setCircleObjectsHtml] = useState<
    {
      html: string;
      properties: CircleValues;
      object: Partial<IObject>;
      preview: any;
    }[]
  >([]);

  const [starObjectsHtml, setStarObjectsHtml] = useState<
    {
      html: string;
      properties: CircleValues;
      object: Partial<IObject>;
      preview: any;
    }[]
  >([]);

  const [polyObjectsHtml, setPolyObjectsHtml] = useState<
    {
      html: string;
      properties: CircleValues;
      object: Partial<IObject>;
      preview: any;
    }[]
  >([]);

  const [lineObjectsHtml, setLineObjectsHtml] = useState<
    {
      html: string;
      properties: LineValues;
      object: Partial<IObject>;
      preview: any;
    }[]
  >([]);

  const retPolyHtml = ({
    w,
    h,
    sides = 5,
    previewW = 80,
    previewH = 80,
    strokeWidth = "2",
    paddingTop,
  }: {
    w: number;
    h: number;
    sides?: number;
    previewW?: number;
    previewH?: number;
    strokeWidth?: string;
    paddingTop?: string;
  }) => {
    const properties = {
      strokeWidth: strokeWidth,
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fill: { r: 120, g: 120, b: 120, a: 1 },
      sides,
    };

    let polyObj = createStarObject() as IObject;
    polyObj.left = 0;
    polyObj.top = 0;
    polyObj.width = w;
    polyObj.height = h;
    polyObj.style = { overflow: "visible" };
    polyObj.properties = {
      strokeWidth: strokeWidth,
      strokeColor: { r: 200, g: 200, b: 200, a: 1 },
      fill: { r: 80, g: 80, b: 80, a: 1 },
      sides,
    };

    const html = getPolygonHtml({
      object: polyObj,
      deviceType: "device-independent" as DeviceType,
      calculatedObjectSize: { left: 0, top: 0, width: w, height: h },
    });

    return {
      html,
      properties,
      object: { width: w * 4, height: h * 4 },
      preview: { previewH, previewW, paddingTop },
    };
  };

  const retStarHtml = ({
    w,
    h,
    radius = 50,
    points = 5,
    previewW = 80,
    previewH = 80,
    strokeWidth = "2",
  }: {
    w: number;
    h: number;
    radius?: number;
    points?: number;
    previewW?: number;
    previewH?: number;
    strokeWidth?: string;
  }) => {
    const properties = {
      strokeWidth: strokeWidth,
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fill: { r: 120, g: 120, b: 120, a: 1 },
      points,
      radius,
    };

    let rectObj = createStarObject() as IObject;
    rectObj.left = 0;
    rectObj.top = 0;
    rectObj.width = w;
    rectObj.height = h;
    rectObj.style = { overflow: "visible" };
    rectObj.properties = {
      strokeWidth: strokeWidth,
      strokeColor: { r: 200, g: 200, b: 200, a: 1 },
      fill: { r: 80, g: 80, b: 80, a: 1 },
      points,
      radius,
    };

    const html = getStarHtml({
      object: rectObj,
      deviceType: "device-independent" as DeviceType,
      calculatedObjectSize: { left: 0, top: 0, width: w, height: h },
    });

    return {
      html,
      properties,
      object: { width: w * 4, height: h * 4 },
      preview: { previewH, previewW },
    };
  };

  const retCircleHtml = ({
    w,
    h,
    type = "ellipse",
    previewW = 80,
    previewH = 80,
  }: {
    w: number;
    h: number;
    type?: "ellipse" | "circle";
    previewW?: number;
    previewH?: number;
  }) => {
    const properties = {
      strokeWidth: "5",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fill: { r: 120, g: 120, b: 120, a: 1 },
      type,
    };

    let rectObj = createCircleObject() as IObject;
    rectObj.left = 0;
    rectObj.top = 0;
    rectObj.width = w;
    rectObj.height = h;
    rectObj.style = { overflow: "visible" };
    rectObj.properties = {
      strokeWidth: "2",
      strokeColor: { r: 200, g: 200, b: 200, a: 1 },
      fill: { r: 80, g: 80, b: 80, a: 1 },
      type,
    };

    const html = getCircleHtml({
      object: rectObj,
      deviceType: "device-independent" as DeviceType,
      calculatedObjectSize: { left: 0, top: 0, width: w, height: h },
    });

    return {
      html,
      properties,
      object: { width: w * 4, height: h * 4 },
      preview: { previewH, previewW },
    };
  };

  const retRectHtml = ({ w, h, r }: { w: number; h: number; r: string }) => {
    const properties = {
      strokeWidth: "5",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: { r: 120, g: 120, b: 120, a: 1 },
      cornerRadius: r,
    };

    let rectObj = createRectangleObject() as IObject;
    rectObj.left = 0;
    rectObj.top = 0;
    rectObj.width = w;
    rectObj.height = h;
    rectObj.style = { overflow: "visible" };
    rectObj.properties = {
      strokeWidth: "2",
      strokeColor: { r: 200, g: 200, b: 200, a: 1 },
      fill: { r: 80, g: 80, b: 80, a: 1 },
      cornerRadius: r,
    };

    const html = getRectangleHtml({
      object: rectObj,
      deviceType: "device-independent" as DeviceType,
      calculatedObjectSize: { left: 0, top: 0, width: w, height: h },
    });

    return { html, properties, object: { width: w * 4, height: h * 4 } };
  };

  const retLineHtml = ({
    w,
    stroke = 5,
    previewW = 80,
    previewH = 80,
    dasharray = "",
  }: {
    w: number;
    stroke: number;
    previewW?: number;
    previewH?: number;
    dasharray: string;
  }) => {
    const properties: LineValues = {
      strokeWidth: stroke,
      strokeColor: { r: 255, g: 255, b: 255, a: 1 },
      strokeLineCap: "miter",
      strokeDashArray: dasharray,
    };

    let rectObj = createLineObject() as IObject;
    rectObj.x1 = 0;
    rectObj.y1 = 0;
    rectObj.x2 = w;
    rectObj.y2 = 0;
    rectObj.left = 0;
    rectObj.top = 0;
    rectObj.width = w;
    rectObj.height = stroke;
    rectObj.style = { overflow: "visible" };
    rectObj.properties = {
      strokeWidth: stroke,
      strokeColor: { r: 200, g: 200, b: 200, a: 1 },
      strokeLineCap: "miter",
      strokeDashArray: dasharray,
    };

    const html = getLineHtml({
      object: rectObj,
      deviceType: "device-independent" as DeviceType,
      calculatedObjectSize: { left: 0, top: 0, width: w, height: stroke },
    });

    return {
      html,
      properties,
      object: { width: w * 4, height: stroke, x1: 0, y1: 0, x2: w * 4, y2: 0 },
      preview: { previewH, previewW },
    };
  };

  useEffect(() => {
    const rect1 = retRectHtml({ w: 80, h: 80, r: "0px" });
    const rect2 = retRectHtml({ w: 80, h: 80, r: "20px" });
    const rect3 = retRectHtml({ w: 80, h: 55, r: "0px" });
    const rect4 = retRectHtml({ w: 80, h: 55, r: "20px" });

    setRectObjectsHtml([rect1, rect2, rect3, rect4]);

    const circle1 = retCircleHtml({ w: 80, h: 80, type: "circle" });
    const circle2 = retCircleHtml({
      w: 50,
      h: 50,
      type: "circle",
      previewW: 50,
      previewH: 50,
    });
    const circle3 = retCircleHtml({ w: 55, h: 80 });
    const circle4 = retCircleHtml({ w: 80, h: 55 });

    setRectObjectsHtml([rect1, rect2, rect3, rect4]);
    setCircleObjectsHtml([circle1, circle2, circle3, circle4]);

    const star1 = retStarHtml({ w: 80, h: 80 });
    const star2 = retStarHtml({ w: 80, h: 80, points: 18, radius: 90 });
    const star3 = retStarHtml({ w: 80, h: 80, points: 4, radius: 20 });
    const star4 = retStarHtml({
      w: 80,
      h: 80,
      points: 20,
      radius: 30,
      strokeWidth: "1",
    });

    setStarObjectsHtml([star1, star2, star3, star4]);

    const poly1 = retPolyHtml({ w: 80, h: 80, sides: 3, paddingTop: "10px" });
    const poly2 = retPolyHtml({ w: 80, h: 80, sides: 5 });
    const poly3 = retPolyHtml({ w: 80, h: 80, sides: 8 });
    const poly4 = retPolyHtml({
      w: 80,
      h: 80,
      sides: 16,
    });

    setPolyObjectsHtml([poly1, poly2, poly3, poly4]);

    const line1 = retLineHtml({ w: 80, stroke: 5 });
    const line2 = retLineHtml({ w: 80, stroke: 10 });
    const line3 = retLineHtml({ w: 80, stroke: 5, dasharray: "5,5" });
    const line4 = retLineHtml({
      w: 80,
      stroke: 5,
      dasharray: "10,10,3,3,3,3,3,10",
    });

    setLineObjectsHtml([line1, line2, line3, line4]);
  }, []);

  return (
    <div className={cx(themeClass, css.shapePreviewPanel)}>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <Button icon="cross" minimal onClick={onRequestClose} />
      </div>
      <div className={css.shapesSectionHolder}>
        <section
          style={{ flexGrow: 0, minHeight: "10%" }}
          className={cx({
            [css.open]: visibleSectionIds[ShapeSections.Line],
          })}
        >
          <div
            className={css.sectionHeader}
            onClick={() => toggleSection(ShapeSections.Line)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                visibleSectionIds[ShapeSections.Line]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button> */}
            <span>Line</span>
          </div>
          <div
            style={{
              padding: "10px",
              display: "flex",
              columnGap: "20px",
              alignItems: "center",
            }}
          >
            {lineObjectsHtml.map((obj) => {
              return (
                <div
                  className={css.objectHolder}
                  onClick={() => {
                    if (replaceItem?.type === "shape") {
                      _replaceObject(
                        replaceItem.objectId!,
                        LINE,
                        {
                          ...replaceItem.objectProps,
                          x1: 0,
                          y1: 0,
                          x2: replaceItem.objectProps.width,
                          y2: 0,
                        },
                        {
                          ...obj.properties,
                          ...replaceItem.values,
                        }
                      );
                      onRequestClose();
                      return;
                    }

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        LINE,
                        {
                          left: 100, //(documentSize.width - 960) / 2,
                          top: 100, //(documentSize.height - 540) / 2,
                          ...obj.object,
                        },
                        obj.properties
                      );
                      onRequestClose();
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: obj.html ?? "" }}
                  ></div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{ flexGrow: 0, minHeight: "10%" }}
          className={cx({
            [css.open]: visibleSectionIds[ShapeSections.Rectangle],
          })}
        >
          <div
            className={css.sectionHeader}
            onClick={() => toggleSection(ShapeSections.Rectangle)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                visibleSectionIds[ShapeSections.Rectangle]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button> */}
            <span>Rectangle</span>
          </div>
          <div
            style={{
              padding: "10px",
              display: "flex",
              columnGap: "20px",
              alignItems: "center",
            }}
          >
            {rectObjectsHtml.map((obj) => {
              return (
                <div
                  className={css.objectHolder}
                  onClick={() => {
                    if (replaceItem?.type === "shape") {
                      _replaceObject(
                        replaceItem.objectId!,
                        RECTANGLE,
                        {
                          ...replaceItem.objectProps,
                        },
                        {
                          ...obj.properties,
                          ...replaceItem.values,
                        }
                      );
                      onRequestClose();
                      return;
                    }

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        RECTANGLE,
                        {
                          left: 100, //(documentSize.width - 960) / 2,
                          top: 100, //(documentSize.height - 540) / 2,
                          ...obj.object,
                        },
                        obj.properties
                      );
                      onRequestClose();
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: obj.html ?? "" }}
                  ></div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{ flexGrow: 0, minHeight: "10%" }}
          className={cx({
            [css.open]: visibleSectionIds[ShapeSections.Circle],
          })}
        >
          <div
            className={css.sectionHeader}
            onClick={() => toggleSection(ShapeSections.Circle)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                visibleSectionIds[ShapeSections.Circle]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button> */}
            <span>Circle</span>
          </div>
          <div
            style={{
              padding: "10px",
              display: "flex",
              columnGap: "20px",
              alignItems: "center",
            }}
          >
            {circleObjectsHtml.map((obj) => {
              return (
                <div
                  className={css.objectHolder}
                  onClick={() => {
                    if (replaceItem?.type === "shape") {
                      _replaceObject(
                        replaceItem.objectId!,
                        CIRCLE,
                        {
                          ...replaceItem.objectProps,
                        },
                        {
                          ...obj.properties,
                          ...replaceItem.values,
                        }
                      );
                      onRequestClose();
                      return;
                    }

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        CIRCLE,
                        {
                          left: 100, //(documentSize.width - 960) / 2,
                          top: 100, //(documentSize.height - 540) / 2,
                          ...obj.object,
                        },
                        obj.properties
                      );
                      onRequestClose();
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                >
                  <div
                    style={{
                      maxWidth: obj.preview.previewW,
                      maxHeight: obj.preview.previewH,
                    }}
                    dangerouslySetInnerHTML={{ __html: obj.html ?? "" }}
                  ></div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{ flexGrow: 0, minHeight: "10%" }}
          className={cx({
            [css.open]: visibleSectionIds[ShapeSections.Star],
          })}
        >
          <div
            className={css.sectionHeader}
            onClick={() => toggleSection(ShapeSections.Star)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                visibleSectionIds[ShapeSections.Star]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button> */}
            <span>Star</span>
          </div>
          <div
            style={{
              padding: "10px",
              display: "flex",
              columnGap: "20px",
              alignItems: "center",
            }}
          >
            {starObjectsHtml.map((obj) => {
              return (
                <div
                  className={css.objectHolder}
                  onClick={() => {
                    if (replaceItem?.type === "shape") {
                      _replaceObject(
                        replaceItem.objectId!,
                        STAR,
                        {
                          ...replaceItem.objectProps,
                        },
                        {
                          ...obj.properties,
                          ...replaceItem.values,
                        }
                      );
                      onRequestClose();
                      return;
                    }

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        STAR,
                        {
                          left: 100, //(documentSize.width - 960) / 2,
                          top: 100, //(documentSize.height - 540) / 2,
                          ...obj.object,
                        },
                        obj.properties
                      );
                      onRequestClose();
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                >
                  <div
                    style={{
                      maxWidth: obj.preview.previewW,
                      maxHeight: obj.preview.previewH,
                    }}
                    dangerouslySetInnerHTML={{ __html: obj.html ?? "" }}
                  ></div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{ flexGrow: 0, minHeight: "10%" }}
          className={cx({
            [css.open]: visibleSectionIds[ShapeSections.Polygon],
          })}
        >
          <div
            className={css.sectionHeader}
            onClick={() => toggleSection(ShapeSections.Polygon)}
          >
            {/* <Button
              minimal
              small={true}
              icon={
                visibleSectionIds[ShapeSections.Polygon]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button> */}
            <span>Polygon</span>
          </div>
          <div
            style={{
              padding: "10px",
              display: "flex",
              columnGap: "20px",
              alignItems: "center",
            }}
          >
            {polyObjectsHtml.map((obj) => {
              return (
                <div
                  className={css.objectHolder}
                  onClick={() => {
                    if (replaceItem?.type === "shape") {
                      _replaceObject(
                        replaceItem.objectId!,
                        POLYGON,
                        {
                          ...replaceItem.objectProps,
                        },
                        {
                          ...obj.properties,
                          ...replaceItem.values,
                        }
                      );
                      onRequestClose();
                      return;
                    }

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        POLYGON,
                        {
                          left: 100, //(documentSize.width - 960) / 2,
                          top: 100, //(documentSize.height - 540) / 2,
                          ...obj.object,
                        },
                        obj.properties
                      );
                      onRequestClose();
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                >
                  <div
                    style={{
                      maxWidth: obj.preview.previewW,
                      maxHeight: obj.preview.previewH,
                      ...(obj.preview.paddingTop
                        ? { paddingTop: obj.preview.paddingTop }
                        : {}),
                    }}
                    dangerouslySetInnerHTML={{ __html: obj.html ?? "" }}
                  ></div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  activeLayerId: state.project.selection.activeLayerId,
  themeClass: state.project.settings.themeClass,
});

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _replaceObject: replaceObject,
};

export default connect(mapStateToProps, mapDispatchToProps)(ShapePreviewPanel);
