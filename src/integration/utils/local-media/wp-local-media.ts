// used for dev mode only
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";

/**
 * used for dev mode only, returns image from local storage
 */
export function getMediaSrc(
  mediaItem: SaaSMediaData,
  preferredSize = "original",
  propertyToUse: "previewSizes" | "mediaSizes" = "mediaSizes"
): string {
  let originalFileName = mediaItem[propertyToUse].find(
    (size) => size.sizeType === preferredSize
  )?.sourceFilename;

  if (!originalFileName) {
    originalFileName = mediaItem[propertyToUse].find(
      (size) => size.sizeType === "original"
    )?.sourceFilename;
  }

  if (
    originalFileName?.startsWith("http:") ||
    originalFileName?.startsWith("https:")
  ) {
    return originalFileName;
  }

  // debugger;

  return `${daapForcerefreshSettings.baseMediaUrl}/${originalFileName}`;
}
