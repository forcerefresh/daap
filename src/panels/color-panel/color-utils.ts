import { cloneDeep, isNull } from "lodash-es";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { ImageColors } from "../../store/reducers/i-colors";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getMediaSrc } from "../../integration/utils/local-media";
import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";

import { extractColorsFromSrc } from "extract-colors";

export async function processImagesColors(props: {
  imagesColors: ImageColors[];
  objectById: {
    [id: string]: IObject<{}>;
  };
}) {
  const { imagesColors, objectById } = props;

  const refImagesColors = cloneDeep(imagesColors);

  let exist = false;
  for (const imageColors of refImagesColors) {
    if (isNull(imageColors.colors)) {
      exist = true;
      const src = getMediaSrc(
        objectById[imageColors.objectId].properties?.image
      );
      imageColors.colors = await processImageColors(src);
    }
  }

  return exist ? refImagesColors : null;
}

async function processImageColors(src: string): Promise<RGBColor[]> {
  const colors = await extractColorsFromImageSrc(src);

  return colors;
}

async function extractColorsFromImageSrc(src: string) {
  try {
    // Extract colors using extract-colors
    const colors = await extractColorsFromSrc(src, {
      crossOrigin: "anonymous", // Required if fetching external images
      format: "array", // Get colors as RGB arrays
    } as any);

    // Convert the result to { r, g, b } format
    const rgbColors = colors.map((color) => ({
      r: color.red,
      g: color.green,
      b: color.blue,
    }));

    return rgbColors;
  } catch (error) {
    logger.app.error("Error extracting colors:", error);
    return [];
  }
}
