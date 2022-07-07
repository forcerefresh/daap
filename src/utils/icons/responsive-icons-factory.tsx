import React from "react";

import { ReactComponent as PhoneIcon } from "../../assets/icons/phone.svg";
import { ReactComponent as TabletIcon } from "../../assets/icons/tablet.svg";
import { ReactComponent as LaptopIcon } from "../../assets/icons/laptop.svg";
import { ReactComponent as MonitorIcon } from "../../assets/icons/monitor.svg";

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
        <PhoneIcon
          key={icon}
          style={{
            width: w ? w : "30px",
            height: h ? h : "30px",
            fill: c ? c : "gray",
            transform: rotate ? "rotate(90deg)" : "",
            ...cssStyle,
          }}
        />
      );
    case "tablet":
      return (
        <TabletIcon
          key={icon}
          style={{
            width: w ? w : "36px",
            height: h ? h : "36px",
            fill: c ? c : "gray",
            transform: rotate ? "rotate(90deg)" : "",
            ...cssStyle,
          }}
        />
      );
    case "laptop":
      return (
        <LaptopIcon
          key={icon}
          style={{
            width: w ? w : "56px",
            height: h ? h : "56px",
            fill: c ? c : "gray",
            transform: rotate ? "rotate(90deg)" : "",
            ...cssStyle,
          }}
        />
      );
    case "desktop":
      return (
        <MonitorIcon
          key={icon}
          style={{
            width: w ? w : "56px",
            height: h ? h : "56px",
            fill: c ? c : "gray",
            transform: rotate ? "rotate(90deg)" : "",
            ...cssStyle,
          }}
        />
      );
    default:
      return null;
  }
}
