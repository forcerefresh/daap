import React from "react";
import { RGBColor } from "react-color";
import { getBgColor } from "../../../../utils/utils";
import css from "./Header1.module.scss";

export interface Header1Props {
  backgroundColor?: RGBColor;
  itemsColor?: RGBColor;
}

export const Header1: React.FC<Header1Props> = (props) => {
  const {
    backgroundColor = { r: 0, g: 0, b: 0, a: 0 },
    itemsColor = { r: 0, g: 0, b: 0, a: 0 },
  } = props;

  const itemStyle: React.CSSProperties = {
    ...getBgColor(itemsColor),
  };

  return (
    <div className={css.header1}>
      <div className={css.logo} style={itemStyle}></div>
      <div className={css.menu}>
        <div className={css.menuItem} style={itemStyle}></div>
        <div className={css.menuItem} style={itemStyle}></div>
        <div className={css.menuItem} style={itemStyle}></div>
        <div className={css.menuItem} style={itemStyle}></div>
      </div>
    </div>
  );
};
