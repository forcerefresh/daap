import { Position, Toaster } from "@blueprintjs/core";

export const AppToaster = Toaster.create({
  className: "root-toaster",
  position: Position.BOTTOM_LEFT,
  maxToasts: 3,
});
