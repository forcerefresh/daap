import { RGBColor } from "react-color";
import { ILinearGradientValue } from "webslider-sdk/lib/inputs/i-inputs";
import { convertRGBColor2CSSStyle } from "webslider-sdk/lib/utils/utils";

export function getSVGFill(
  colorOrGradient: ILinearGradientValue | RGBColor,
  objectId: string
) {
  let fill: string | undefined = "transparent";
  let gradient: string | undefined;
  if (typeof (colorOrGradient as RGBColor)?.r !== "undefined") {
    fill = convertRGBColor2CSSStyle(
      colorOrGradient as RGBColor
    ).backgroundColor;
  }
  if ((colorOrGradient as ILinearGradientValue)?.points) {
    fill = `url('#rectangle-gradient-${objectId}')`;

    const rotationPoints = getLinearGradientPoints(
      (colorOrGradient as ILinearGradientValue).angle
    );
    gradient = `<defs>
      <linearGradient 
        id="rectangle-gradient-${objectId}" 
        x1="${rotationPoints.x1}"
        y1="${rotationPoints.y1}"
        x2="${rotationPoints.x2}"
        y2="${rotationPoints.y2}"
      >
        ${(colorOrGradient as ILinearGradientValue)?.points.map((p) => {
          return `<stop offset="${p.stop}%" stop-color="${
            convertRGBColor2CSSStyle(p.color).backgroundColor
          }" />`;
        })}
      </linearGradient>
    </defs>
  `;
  }

  const fillAttr = fill ? ` fill="${fill}" ` : "";

  return { fillAttr, gradient };
}

function getLinearGradientPoints(angle: number) {
  var anglePI = angle * (Math.PI / 180);
  var angleCoords = {
    x1: Math.round(50 + Math.sin(anglePI) * 50) + "%",
    y1: Math.round(50 + Math.cos(anglePI) * 50) + "%",
    x2: Math.round(50 + Math.sin(anglePI + Math.PI) * 50) + "%",
    y2: Math.round(50 + Math.cos(anglePI + Math.PI) * 50) + "%",
  };
  return angleCoords;
}
