import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { IPlayerData } from "../export/i-export-html";
import { Player } from "./player/Player";
import { ILayer, ILayers } from "../store/reducers/i-layers";
import { IPages } from "../store/reducers/i-pages";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { generatePlayerData } from "../export/export-html";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ISettings } from "../store/reducers/i-settings";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { IObjects } from "../store/reducers/i-objects";

import JSZip from "jszip";
import FileSaver from "file-saver";
import * as htmlToImage from "html-to-image";
import { AppToaster } from "../utils/components/app-toaster/AppToaster";
import { convertRGBColor2CSSProperties } from "../utils/utils";

export interface IGenerateImagesArgs {
  pages: IPages;
  layers: ILayers;
  objects: IObjects;
  breakpointConfig: BreakpointConfiguration;
  breakpoints: Breakpoints;
  settings: ISettings;
  extensions: IExtensionItem[];

  selectedDevice: DeviceType;
  imageType: "jpeg" | "png" | "webp" | string;
  imageQuality?: number;
  exportWidth: number;
  exportHeight: number;
}

export async function generateImages(
  args: IGenerateImagesArgs
): Promise<Blob[]> {
  const {
    breakpointConfig,
    breakpoints,
    extensions,
    layers,
    objects,
    pages,
    selectedDevice,
    settings,
    imageType,
    imageQuality,
    exportWidth,
    exportHeight,
  } = args;

  const stageSize = breakpointConfig?.normal.maxSliderSize!;

  const canvasStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: -1200,
    top: 0 + "px",
    left: 0 + "px",
    width: stageSize.width + "px",
    height: stageSize.height + "px",
    // transform: "scale(" + exportWidth / stageSize.width + ")",
    ...convertRGBColor2CSSProperties(settings.sliderBackgroundColor),
  };

  const playerHolderEl = document.createElement("div");
  Object.assign(playerHolderEl.style, canvasStyle);
  document.body.appendChild(playerHolderEl);

  const blobImages: Blob[] = [];
  for await (const pageId of pages.pages) {
    const playerData = generatePlayerData(
      { slides: pages, layers, objects },
      { entityId: pageId, entityType: "slide" },
      breakpointConfig!,
      breakpoints,
      settings,
      extensions,
      { isSave: false, isForThumbnail: true }
    );

    try {
      const blobImage = await generateImage({
        playerData,
        playerHolderEl,
        selectedDevice,
        imageType,
        imageQuality,
        exportWidth,
        exportHeight,
      });
      blobImages.push(blobImage);
    } catch (ex) {
      AppToaster.show({ message: ex?.toString?.(), intent: "danger" });
    }
  }

  document.body.removeChild(playerHolderEl);

  return blobImages;
}

async function generateImage(args: {
  playerData: IPlayerData;
  playerHolderEl: HTMLDivElement;
  selectedDevice: DeviceType;
  imageType: "jpeg" | "png" | string;
  imageQuality?: number;
  exportWidth: number;
  exportHeight: number;
}): Promise<Blob> {
  const {
    playerData,
    playerHolderEl,
    selectedDevice,
    imageType,
    imageQuality = 85,
    exportHeight,
    exportWidth,
  } = args;

  return new Promise((resolve, reject) => {
    const pl = new Player(playerData, playerHolderEl, {
      isApp: true,
      forceDevice: selectedDevice,
    });

    pl.onSlideStarted(async () => {
      let blobImage: Blob | null = null;
      try {
        if (imageType === "jpeg") {
          const imageBase64 = await htmlToImage.toJpeg(playerHolderEl, {
            quality: imageQuality / 100,
            canvasHeight: exportHeight,
            canvasWidth: exportWidth,
          });
          blobImage = convertBase64ToBlob(imageBase64);
        } else if (imageType === "webp") {
          const canvas = await htmlToImage.toCanvas(playerHolderEl, {
            canvasHeight: exportHeight,
            canvasWidth: exportWidth,
          });

          blobImage = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/webp", imageQuality / 100);
          });
        } else {
          blobImage = await htmlToImage.toBlob(playerHolderEl);
        }

        console.log(blobImage);
      } catch (ex) {
        reject(
          "Something went wrong. Image creation has failed (2). Please try again."
        );
      }

      if (blobImage) {
        pl.clear();
        resolve(blobImage);
      } else {
        reject(
          "Something went wrong. Image creation has failed (1). Please try again."
        );
      }
    });

    pl.play();
  });
}

/**
 * Convert BASE64 to BLOB
 * @param base64Image Pass Base64 image data to convert into the BLOB
 */
function convertBase64ToBlob(base64Image: string) {
  // Split into two parts
  const parts = base64Image.split(";base64,");

  // Hold the content type
  const imageType = parts[0].split(":")[1];

  // Decode Base64 string
  const decodedData = window.atob(parts[1]);

  // Create UNIT8ARRAY of size same as row data length
  const uInt8Array = new Uint8Array(decodedData.length);

  // Insert all character code into uInt8Array
  for (let i = 0; i < decodedData.length; ++i) {
    uInt8Array[i] = decodedData.charCodeAt(i);
  }

  // Return BLOB image after conversion
  return new Blob([uInt8Array], { type: imageType });
}
