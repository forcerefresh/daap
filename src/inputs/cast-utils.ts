import {
  IRelativePositionValue,
  IRelativeRotationValue,
} from "../webslider-sdk/src/inputs/i-inputs";

export function relativePosition2Gsap(value: IRelativePositionValue): string {
  const sign = Math.sign(value.value);
  switch (value.position) {
    case "rel":
      return (sign !== -1 ? "+=" : "-=") + Math.abs(value.value);
    case "abs":
      return value.value.toString();
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
