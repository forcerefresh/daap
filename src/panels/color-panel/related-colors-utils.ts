import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import { rgbaToHex } from "../../inputs/color-input/color-utils";
import { hexToRGB } from "../../utils/utils";

const relatedColors = [
  { title: "Complementary", type: "complementary" },
  { title: "Analogous", type: "analogous" },
  { title: "Triadic", type: "triadic" },
  { title: "Split Complementary", type: "splitComplementary" },
  { title: "Tetradic", type: "tetradic" },
  { title: "Square", type: "square" },
  { title: "Monochromatic", type: "monochromatic" },
  { title: "Shades", type: "shades" },
  { title: "Tints", type: "tints" },
  { title: "Compound", type: "compound" },
  { title: "Neutral", type: "neutral" },
  { title: "Double Split Complementary", type: "doubleSplitComplementary" },
];
export function getRelatedColors(
  color: RGBColor
): { title: string; colors: RGBColor[][] }[] {
  const { blackDistance, whiteDistance } = getWhiteBlackDistance(
    rgbaToHex(color)!
  );

  if (whiteDistance < 0.1) return [];
  if (blackDistance < 0.1) return [];

  const retArr: { title: string; colors: RGBColor[][] }[] = [];

  relatedColors.forEach((value) => {
    const colorsHex = generateColorScheme(rgbaToHex(color)!, value.type);
    const colors = colorsHex.map((col) => hexToRGB(col)!);
    retArr.push({ title: value.title, colors: [colors] });
  });

  return retArr;
}

// =============================================
// Core Color Scheme Logic (12 schemes)
// =============================================
function generateColorScheme(baseColor: string, scheme: string): string[] {
  const hsl = hexToHsl(baseColor);
  let hues: number[] = [];
  let colors: string[] = [];

  // Get base HSL values
  const h = hsl.h;
  const s = hsl.s;
  const l = hsl.l;

  switch (scheme) {
    // Basic schemes
    case "complementary":
      hues = [h, (h + 180) % 360];
      break;

    case "analogous":
      hues = [(h - 30) % 360, h, (h + 30) % 360];
      break;

    case "triadic":
      hues = [h, (h + 120) % 360, (h + 240) % 360];
      break;

    case "splitComplementary":
      hues = [h, (h + 150) % 360, (h + 210) % 360];
      break;

    case "tetradic":
      hues = [h, (h + 60) % 360, (h + 180) % 360, (h + 240) % 360];
      break;

    case "square":
      hues = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360];
      break;

    // Monochromatic variations
    case "monochromatic":
      return [
        hslToHex({ h, s: s * 0.8, l: l * 0.9 }),
        hslToHex({ h, s: s * 1.1, l: l * 1.1 }),
        hslToHex({ h, s: s * 0.7, l: l * 1.2 }),
      ];

    case "shades":
      return [
        hslToHex({ h, s, l: l * 0.7 }),
        hslToHex({ h, s, l: l * 0.5 }),
        hslToHex({ h, s, l: l * 0.3 }),
      ];

    case "tints":
      return [
        hslToHex({ h, s, l: l * 1.2 }),
        hslToHex({ h, s, l: l * 1.4 }),
        hslToHex({ h, s, l: l * 1.6 }),
      ];

    // Advanced schemes
    case "compound":
      hues = [h, (h + 30) % 360, (h + 150) % 360, (h + 180) % 360];
      break;

    case "neutral":
      hues = [h, (h + 15) % 360, (h + 30) % 360, (h + 45) % 360];
      break;

    case "doubleSplitComplementary":
      hues = [
        h,
        (h + 30) % 360,
        (h + 150) % 360,
        (h + 180) % 360,
        (h + 210) % 360,
      ];
      break;

    default:
      throw new Error(`Unknown scheme: ${scheme}`);
  }

  // Convert hues to hex colors
  return hues.map((hue) => hslToHex({ h: hue, s, l }));
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// Helper: Hex to HSL
function hexToHsl(hex: string): HSL {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h: number,
    s: number,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

// Helper: HSL to Hex
function hslToHex({ h, s, l }: HSL): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getWhiteBlackDistance(hexColor: string): {
  whiteDistance: number;
  blackDistance: number;
} {
  // Parse hex color
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;

  // Calculate distance from white (Euclidean distance in RGB space)
  const whiteDistance =
    Math.sqrt(Math.pow(1 - r, 2) + Math.pow(1 - g, 2) + Math.pow(1 - b, 2)) /
    Math.sqrt(3); // Normalize to 0-1 range

  // Calculate distance from black
  const blackDistance =
    Math.sqrt(Math.pow(r, 2) + Math.pow(g, 2) + Math.pow(b, 2)) / Math.sqrt(3); // Normalize to 0-1 range

  return { whiteDistance, blackDistance };
}
