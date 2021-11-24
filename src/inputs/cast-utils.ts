import { IRelativePositionValue } from "./types";

export function relativePosition2Gsap(value: IRelativePositionValue): string {
  const sign = Math.sign(value.value);
  switch (value.position) {
    case "rel":
      return (sign !== -1 ? "+=" : "-=") + Math.abs(value.value);
    case "abs":
      return value.value.toString();
  }
}
