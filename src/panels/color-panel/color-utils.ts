import { cloneDeep, isNull } from "lodash-es";
import { ImageColors } from "../../store/reducers/i-colors";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getMediaSrc } from "../../integration/utils/local-media";
import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";

import { extractColors, extractColorsFromSrc } from "extract-colors";

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
  const imageFile = await urlToFile(src, "noname.jpg", "image/jpeg");

  const colors = await extractColorsFromImageSrc(src);

  return colors;
}

async function getBlobFromImageUrl(imageUrl: string) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Convert the response to a Blob
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("Error fetching the image:", error);
    return null;
  }
}

async function extractColorsFromImageSrc(src: string) {
  try {
    // Convert Blob to a data URL (or use URL.createObjectURL)
    // const dataUrl = await blobToDataUrl(imageBlob);

    // Extract colors using extract-colors
    const colors = await extractColorsFromSrc(src, {
      crossOrigin: "anonymous", // Required if fetching external images
      format: "array", // Get colors as RGB arrays
    });

    // Convert the result to { r, g, b } format
    const rgbColors = colors.map((color) => ({
      r: color.red,
      g: color.green,
      b: color.blue,
    }));

    return rgbColors;
  } catch (error) {
    console.error("Error extracting colors:", error);
    return [];
  }
}

// Helper function: Convert Blob to Data URL
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read Blob"));
    reader.readAsDataURL(blob);
  });
}

async function urlToFile(url, filename, mimeType) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType || blob.type });
  } catch (error) {
    console.error("Error converting URL to File:", error);
    return null;
  }
}
