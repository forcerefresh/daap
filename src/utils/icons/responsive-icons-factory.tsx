import React from "react";
import { ResponsiveIcon } from "../../store/reducers/settings";

import { ReactComponent as PhoneIcon } from "../../assets/icons/phone.svg";
import { ReactComponent as TabletIcon } from "../../assets/icons/tablet.svg";
import { ReactComponent as LaptopIcon } from "../../assets/icons/laptop.svg";
import { ReactComponent as MonitorIcon } from "../../assets/icons/monitor.svg";

export function getResponsiveIcon(icon: ResponsiveIcon) {
  switch (icon) {
    case "phone":
      return (
        <PhoneIcon style={{ width: "30px", height: "30px", fill: "gray" }} />
      );
    case "tablet":
      return (
        <TabletIcon style={{ width: "36px", height: "36px", fill: "gray" }} />
      );
    case "laptop":
      return (
        <LaptopIcon style={{ width: "56px", height: "56px", fill: "gray" }} />
      );
    default:
      return null;
  }
}
