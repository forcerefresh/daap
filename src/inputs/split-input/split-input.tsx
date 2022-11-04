import { Position, Toaster, Label } from "@blueprintjs/core";
import cx from "classnames";
import { isEqual, uniqWith } from "lodash-es";
import React from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { ISplitInput, IUpdateInput } from "webslider-sdk2/lib/inputs/i-inputs";
import css from "./split-input.module.scss";

/*export const LocalToaster = Toaster.create({
  className: "toaster",
  position: Position.TOP,
});*/

const roundTo10 = (n: number) => {
  return Math.round(n / 10) * 10;
};
export const SplitInputForm: React.FC<ISplitInput & IUpdateInput> = (props) => {
  const { displayName, helperText, value, onChange } = props;

  const onAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const adjustment = -4;
    var rect = e.currentTarget.getBoundingClientRect();
    var x = roundTo10(e.clientX - rect.left + adjustment); // x position within the element.
    var y = roundTo10(e.clientY - rect.top + adjustment); // y position within the element.
    //onChange({ x, y });
  };

  const getPointFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const adjustment = 0; // -4;
    var rect = e.currentTarget.getBoundingClientRect();
    var x = e.clientX - rect.left + adjustment; // x position within the element.
    var y = e.clientY - rect.top + adjustment; // y position within the element.
    return { x, y };
  };

  const sortPoints = (points: { x: number; y: number }[]) => {
    const leftArr = points
      .filter((p) => p.x == 0)
      .sort((p1, p2) => (p1.y > p2.y ? 1 : -1));
    const rightArr = points
      .filter((p) => p.x == 100)
      .sort((p1, p2) => (p1.y > p2.y ? 1 : -1));
    const topArr = points
      .filter((p) => p.y == 0)
      .sort((p1, p2) => (p1.x > p2.x ? 1 : -1));
    const bottomArr = points
      .filter((p) => p.y == 100)
      .sort((p1, p2) => (p1.x > p2.x ? 1 : -1));

    return uniqWith(
      [...leftArr, ...bottomArr, ...rightArr.reverse(), ...topArr.reverse()],
      isEqual
    );
  };

  const onLeftClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const point = getPointFromEvent(e);
    const p = { x: 0, y: point.y / 2 };
    value.points.push(p);
    value.points = sortPoints(value.points);
    onChange(value);
  };

  const onRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const point = getPointFromEvent(e);
    const p = { x: 100, y: point.y / 2 };
    value.points.push(p);
    value.points = sortPoints(value.points);
    onChange(value);
  };

  const onTopClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const point = getPointFromEvent(e);
    const p = { x: point.x / 2, y: 0 };
    value.points.push(p);
    value.points = sortPoints(value.points);
    onChange(value);
  };

  const onBottomClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const point = getPointFromEvent(e);
    const p = { x: point.x / 2, y: 100 };
    value.points.push(p);
    value.points = sortPoints(value.points);
    onChange(value);
  };

  const isValid = () => {
    if (value.points.length < 4) return false;

    const hasLeft = !!value.points.find((p) => p.x === 0);
    const hasRight = !!value.points.find((p) => p.x === 100);
    const hasTop = !!value.points.find((p) => p.y === 0);
    const hasBottom = !!value.points.find((p) => p.y === 100);

    return hasLeft && hasRight && hasTop && hasBottom;
  };

  return (
    <div className={css.container}>
      <Label>{displayName}</Label>
      <div>
        <div className={css.area} onClick={onAreaClick}>
          <div className={cx(css.left, css.border)} onClick={onLeftClick}></div>
          <div
            className={cx(css.right, css.border)}
            onClick={onRightClick}
          ></div>
          <div className={cx(css.top, css.border)} onClick={onTopClick}></div>
          <div
            className={cx(css.bottom, css.border)}
            onClick={onBottomClick}
          ></div>

          <Draggable
            axis="both"
            //handle=".handle"
            defaultPosition={{ x: 0, y: 0 }}
            position={{
              x: value.center.x * 2,
              y: value.center.y * 2,
            }}
            grid={[1, 1]}
            scale={1}
            bounds={{ left: 0, right: 200, top: 0, bottom: 200 }}
            onDrag={(evt: DraggableEvent, data: DraggableData) => {
              value.center = {
                x: data.x / 2,
                y: data.y / 2,
              };
              onChange(value);
            }}
          >
            <div className={css.point}></div>
          </Draggable>
          {value.points.map((point, idx) => {
            return (
              <>
                <div
                  className={css.point}
                  style={{
                    left: point.x * 2 + "px",
                    top: point.y * 2 + "px",
                  }}
                  onClick={() => {
                    value.points.splice(idx, 1);
                    onChange(value);
                  }}
                ></div>

                <div style={{ position: "absolute", pointerEvents: "none" }}>
                  <svg width="210" height="210">
                    <line
                      x1={value.center.x * 2 + 4 + "px"}
                      y1={value.center.y * 2 + 4 + "px"}
                      x2={point.x * 2 + 4 + "px"}
                      y2={point.y * 2 + 4 + "px"}
                      stroke="white"
                    />
                  </svg>
                </div>
              </>
            );
          })}
        </div>
        <div className="bp3-form-helper-text">{helperText}</div>
        {!isValid() && (
          <div className={cx("bp3-form-helper-text", "error", css.error)}>
            Each side or rectangle should have at least 1 point, otherwise some
            part of image will be cut out.
          </div>
        )}
      </div>
    </div>
  );
};
