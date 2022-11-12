import React from "react";
import { RGBColor } from "react-color";
import { convertRGBColor2CSSProperties } from "../../../../utils/utils";
import css from "./Body1.module.scss";

export interface Header1Props {
  backgroundColor?: RGBColor;
  itemsColor?: RGBColor;
}

export const Body1: React.FC<Header1Props> = (props) => {
  const {
    backgroundColor = { r: 0, g: 0, b: 0, a: 0 },
    itemsColor = { r: 0, g: 0, b: 0, a: 0 },
  } = props;

  const itemStyle: React.CSSProperties = {
    ...convertRGBColor2CSSProperties(itemsColor),
  };

  return (
    <div className={css.body1}>
      <div className={css.row}>
        <div className={css.item} style={itemStyle}></div>
        <div className={css.item} style={itemStyle}></div>
        <div className={css.item} style={itemStyle}></div>
      </div>
      <div className={css.row}>
        <div className={css.item} style={itemStyle}></div>
      </div>
      <div className={css.row}>
        <div className={css.item} style={itemStyle}></div>
      </div>
    </div>
  );
};
