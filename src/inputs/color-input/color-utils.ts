import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";

export function rgbaToHex(
  color: RGBColor | null | undefined
): string | null | undefined {
  if (!color) return color;

  // Convert each RGB component to hex and pad with zero if needed
  const r = Math.round(color.r).toString(16).padStart(2, "0");
  const g = Math.round(color.g).toString(16).padStart(2, "0");
  const b = Math.round(color.b).toString(16).padStart(2, "0");

  // Convert alpha if provided (0-1 to 0-255)
  let a = "";
  if (color.a !== undefined) {
    const alpha = Math.round(color.a * 255);
    a = alpha.toString(16).padStart(2, "0");
  }

  return `#${r}${g}${b}${a}`.toUpperCase();
}
