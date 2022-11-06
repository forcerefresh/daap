import {
  IRelativePositionValue,
  IRelativeRotationValue,
} from "webslider-sdk/lib/inputs/i-inputs";

export function relativePosition2Gsap(value: any): string {
  const sign = Math.sign(value.value);
  switch (value.position) {
    case "rel":
      return (sign !== -1 ? "+=" : "-=") + Math.abs(value.value);
    case "abs":
      return value.value.toString();
    default:
      return "";
  }
}

export function relativeRotation2Gsap(value: IRelativeRotationValue): string {
  const sign = Math.sign(value.value);
  switch (value.position) {
    case "rel":
      return (
        (sign !== -1 ? "+=" : "-=") + Math.abs(value.value) + value.direction
      );
    case "abs":
      return value.value.toString() + value.direction;
  }
}
