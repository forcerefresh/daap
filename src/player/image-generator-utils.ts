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
import { delayPromise } from "../utils/common/delay-utils";
import { noop } from "lodash-es";

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
  args: IGenerateImagesArgs,
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
    ...convertRGBColor2CSSProperties(settings.pageBackgroundColor),
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
      { isSave: false, isForThumbnail: true },
    );

    // await delayPromise(200);
    // await delayPromise(200);
    // await delayPromise(200);

    try {
      const blobImage = await generateImage({
        playerData,
        playerHolderEl,
        selectedDevice,
        imageType,
        imageQuality,
        exportWidth: exportWidth / 2,
        exportHeight: exportHeight / 2,
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

  // Detect Firefox
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  let cleanup = noop;
  let fontEmbedCSS: string;

  return new Promise((resolve, reject) => {
    const pl = new Player(playerData, playerHolderEl, {
      isApp: true,
      forceDevice: selectedDevice,
    });

    pl.onSlideStarted(async () => {
      let blobImage: Blob | null = null;

      if (isFirefox) {
        await document.fonts.ready;
        cleanup = await embedFontsForFirefox();
        fontEmbedCSS = await prepareFontsForExport();
      }

      try {
        if (imageType === "jpeg") {
          const imageBase64 = await htmlToImage.toJpeg(playerHolderEl, {
            quality: imageQuality / 100,
            canvasHeight: exportHeight,
            canvasWidth: exportWidth,
            fontEmbedCSS,
            // cacheBust: true,
            skipFonts: false,
          });
          blobImage = convertBase64ToBlob(imageBase64);
        } else if (imageType === "webp") {
          const canvas = await htmlToImage.toCanvas(playerHolderEl, {
            canvasHeight: exportHeight,
            canvasWidth: exportWidth,
            fontEmbedCSS,
            // cacheBust: true,
            skipFonts: false,
          });

          blobImage = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/webp", imageQuality / 100);
          });
        } else {
          blobImage = await htmlToImage.toBlob(playerHolderEl, {
            fontEmbedCSS,
            // cacheBust: true,
            skipFonts: false,
          });
        }
      } catch (ex) {
        reject(
          "Something went wrong. Image creation has failed (2). Please try again.",
        );
      } finally {
        cleanup();
      }

      if (blobImage) {
        pl.clear();
        resolve(blobImage);
      } else {
        reject(
          "Something went wrong. Image creation has failed (1). Please try again.",
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

async function prepareFontsForExport(root = document) {
  // console.log("Preparing fonts…");

  /* -------------------------------------------------- */
  /* 1. Wait for fonts REALLY loaded */
  /* -------------------------------------------------- */

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // force layout so FF applies fonts
  document.body.offsetHeight;

  /* -------------------------------------------------- */
  /* 2. Load every used font explicitly */
  /* -------------------------------------------------- */

  const usedFonts = new Set();

  root.querySelectorAll("*").forEach((el) => {
    const style = getComputedStyle(el);
    if (!style.fontFamily) return;

    style.fontFamily.split(",").forEach((f) => {
      const name = f.replace(/["']/g, "").trim();
      if (name) usedFonts.add(name);
    });
  });

  // Force-load fonts (VERY important for Firefox)
  await Promise.all(
    [...usedFonts].map((font) =>
      document.fonts.load(`16px "${font}"`).catch(() => {}),
    ),
  );

  /* -------------------------------------------------- */
  /* 3. Collect SAFE @font-face rules */
  /* -------------------------------------------------- */

  let safeFontCSS = "";

  for (const sheet of [...document.styleSheets]) {
    let rules;

    try {
      rules = sheet.cssRules;
    } catch {
      // Firefox blocks cross-origin sheets
      continue;
    }

    if (!rules) continue;

    for (const rule of rules) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;

      const family = rule.style.getPropertyValue("font-family");
      const src = rule.style.getPropertyValue("src");

      // ⭐ Skip broken fonts (this prevents .trim crash)
      if (!family || !src) continue;

      safeFontCSS += rule.cssText + "\n";
    }
  }

  return safeFontCSS;
}

async function embedFontsForFirefox() {
  let css = "";

  for (const sheet of [...document.styleSheets]) {
    let rules;

    try {
      rules = sheet.cssRules;
    } catch {
      continue; // CORS blocked
    }

    if (!rules) continue;

    for (const rule of rules) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;

      const family = rule.style.getPropertyValue("font-family");
      const src = rule.style.getPropertyValue("src");

      if (!family || !src) continue;

      // find font url
      const match = src.match(/url\(["']?([^"')]+)["']?\)/);
      if (!match) continue;

      const fontUrl = match[1];

      try {
        const res = await fetch(fontUrl);
        const blob = await res.blob();

        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        css += `
            @font-face {
              font-family: ${family};
              src: url(${base64});
            }
            `;
      } catch (e) {
        console.warn("Font fetch failed:", fontUrl);
      }
    }
  }

  const style = document.createElement("style");
  style.id = "html-to-image-font-fix";
  style.textContent = css;
  document.head.appendChild(style);

  return () => style.remove(); // cleanup
}
