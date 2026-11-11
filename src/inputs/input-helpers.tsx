import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { getIconSize } from "../panels/action-panel/ActionPanel";
import { getIconByType } from "../store/reducers/settings";
import { getResponsiveIcon } from "../utils/icons/responsive-icons-factory";

export const createInputLabel = (
  label: string,
  propertyName: string,
  removeLayedForDevice = true
) => {
  const deviceType: DeviceType | undefined = propertyName?.split(
    "_D_"
  )[1] as DeviceType;
  if (!deviceType) return label;

  const iconName = getIconByType(deviceType);
  const size = getIconSize(iconName);
  const icon = getResponsiveIcon(iconName, size.w, size.h, "lightgray");

  return (
    <>
      {icon} {!removeLayedForDevice && label}
    </>
  );
};
