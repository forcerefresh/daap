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
  let originalSize = mediaItem[propertyToUse].find(
    (size) => size.sizeType === preferredSize
  );

  if (!originalSize) {
    originalSize = mediaItem[propertyToUse].find(
      (size) => size.sizeType === "original"
    );
  }

  if (originalSize?.sourceFilename) {
    if (
      originalSize.sourceFilename.startsWith("http:") ||
      originalSize.sourceFilename.startsWith("https:")
    ) {
      return originalSize?.sourceFilename;
    }

    if (mediaItem.sourceType === "library") {
      return (
        `${import.meta.env.VITE_SAAS_API_URL}/public/public-templates-media/` +
        originalSize?.sourceFilename
      );
    }
  }

  return `/api/v1/media/${originalSize?.sourceFilename}`;
}
