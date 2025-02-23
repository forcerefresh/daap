import React from "react";

import PhoneIcon from "../../assets/icons/phone.svg?react";
import TabletIcon from "../../assets/icons/tablet.svg?react";
import LaptopIcon from "../../assets/icons/laptop.svg?react";
import MonitorIcon from "../../assets/icons/monitor.svg?react";
import { Icon } from "@blueprintjs/core";

export function getResponsiveIcon(
  icon: string,
  w?: string,
  h?: string,
  c?: string,
  rotate?: boolean,
  cssStyle: React.CSSProperties = {}
) {
  switch (icon) {
    case "phone":
      return (
        <Icon
          icon={
            <PhoneIcon
              key={icon}
              style={{
                width: w ? w : "30px",
                height: h ? h : "30px",
                ...(c ? { fill: c } : {}),
                transform: rotate ? "rotate(90deg)" : "",
                ...cssStyle,
              }}
            />
          }
        />
      );
    case "tablet":
      return (
        <Icon
          icon={
            <TabletIcon
              key={icon}
              style={{
                width: w ? w : "36px",
                height: h ? h : "36px",
                ...(c ? { fill: c } : {}),
                transform: rotate ? "rotate(90deg)" : "",
                ...cssStyle,
              }}
            />
          }
        />
      );
    case "laptop":
      return (
        <Icon
          icon={
            <LaptopIcon
              key={icon}
              style={{
                width: w ? w : "56px",
                height: h ? h : "56px",
                ...(c ? { fill: c } : {}),
                transform: rotate ? "rotate(90deg)" : "",
                ...cssStyle,
              }}
            />
          }
        />
      );
    case "desktop":
      return (
        <Icon
          icon={
            <MonitorIcon
              key={icon}
              style={{
                width: w ? w : "56px",
                height: h ? h : "56px",
                ...(c ? { fill: c } : {}),
                transform: rotate ? "rotate(90deg)" : "",
                ...cssStyle,
              }}
            />
          }
        />
      );
    default:
      return null;
  }
}
