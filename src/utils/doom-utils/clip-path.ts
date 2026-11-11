/**
 * If the SVG has no <clipPath> element, wraps all its children in one.
 * This normalizes plain SVGs (e.g. icons) so they can be used as clip masks.
 */
function ensureClipPathWrapper(svgString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl || svgEl.querySelector("clipPath")) return svgString;

  const clipPath = doc.createElementNS(
    "http://www.w3.org/2000/svg",
    "clipPath",
  );
  Array.from(svgEl.childNodes).forEach((child) => clipPath.appendChild(child));
  svgEl.appendChild(clipPath);

  return new XMLSerializer().serializeToString(doc);
}

export function updateClipPaths(
  svgString: string,
  clipPathAttr: { id: string; clipPathUnits: string; transform?: string },
) {
  // Parse the SVG string
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // Find all clipPath elements
  const clipPaths = doc.querySelectorAll("clipPath");

  // Process each clipPath
  clipPaths.forEach((clipPath, _index) => {
    clipPath.id = clipPathAttr.id;
    clipPath.setAttribute("clipPathUnits", clipPathAttr.clipPathUnits);
    clipPath.setAttribute("transform", clipPathAttr.transform ?? "");
  });

  // Return modified SVG as string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

export function getClipMaskFromSvg(
  svgInput: string,
  clipMaskId: string,
  _width: string,
  _height: string,
) {
  const svg = ensureClipPathWrapper(svgInput);

  const updateSVG = updateClipPaths(svg, {
    id: clipMaskId,
    clipPathUnits: "objectBoundingBox",
  });

  const svgClipMask = createElementFromHTML(updateSVG) as SVGElement;

  const { width: svgWidth, height: svgHeight } = getSvgDimensions(svgClipMask);

  const scaleX = 1 / svgWidth;
  const scaleY = 1 / svgHeight;

  svgClipMask.setAttribute("width", svgWidth.toString());
  svgClipMask.setAttribute("height", svgHeight.toString());

  Array.from(svgClipMask.childNodes).forEach((child) => {
    if ("setAttribute" in child) {
      (child as SVGElement).setAttribute(
        "transform",
        `scale(${scaleX},${scaleY})`,
      );
    }
  });

  return svgClipMask.outerHTML;
}

/**
 * Builds clipPath SVG HTML with a statically computed userSpaceOnUse transform
 * for use in player/export HTML where there is no live DOM to update afterwards.
 */
export function getClipMaskFromSvgForExport(
  svgInput: string,
  clipMaskId: string,
  maskCalcSize: { left: string; top: string; width: string; height: string },
  targetCalcSize: { left: string; top: string; width: string; height: string },
  maskRotation: number,
  maskScale: number,
  targetRotation: number,
  targetScale: number,
): string {
  const normalizedInput = ensureClipPathWrapper(svgInput);
  const svgEl = createElementFromHTML(normalizedInput) as SVGElement;
  if (!svgEl) return "";

  const { width: svgWidth, height: svgHeight } = getSvgDimensions(svgEl);
  if (svgWidth === 0 || svgHeight === 0) {
    return getClipMaskFromSvg(svgInput, clipMaskId, "", "");
  }

  const maskLeft = parseFloat(maskCalcSize.left);
  const maskTop = parseFloat(maskCalcSize.top);
  const maskWidth = parseFloat(maskCalcSize.width);
  const maskHeight = parseFloat(maskCalcSize.height);
  const targetLeft = parseFloat(targetCalcSize.left);
  const targetTop = parseFloat(targetCalcSize.top);

  const dx = maskLeft - targetLeft;
  const dy = maskTop - targetTop;

  const R_t = (targetRotation * Math.PI) / 180;
  const tx = (Math.cos(R_t) * dx + Math.sin(R_t) * dy) / targetScale;
  const ty = (-Math.sin(R_t) * dx + Math.cos(R_t) * dy) / targetScale;

  const scaleX = (maskScale * maskWidth) / (svgWidth * targetScale);
  const scaleY = (maskScale * maskHeight) / (svgHeight * targetScale);
  const relativeRotation = maskRotation - targetRotation;

  const transform = `translate(${tx},${ty}) rotate(${relativeRotation}) scale(${scaleX},${scaleY})`;

  const updatedSvg = updateClipPaths(normalizedInput, {
    id: clipMaskId,
    clipPathUnits: "userSpaceOnUse",
    transform,
  });

  const resultEl = createElementFromHTML(updatedSvg) as SVGElement;
  if (!resultEl) return "";
  resultEl.setAttribute("width", svgWidth.toString());
  resultEl.setAttribute("height", svgHeight.toString());

  return resultEl.outerHTML;
}

function createElementFromHTML(htmlString: string) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return Array.from(div.childNodes).find((child) => {
    return child.nodeName !== "#comment";
  });
}

function getSvgDimensions(svgEl: SVGElement) {
  // Try width/height attributes first
  let width = parseInt(svgEl.getAttribute("width") ?? "");
  let height = parseInt(svgEl.getAttribute("height") ?? "");

  // If invalid, try viewBox
  if (isNaN(width) || isNaN(height) || width === 0 || height === 0) {
    const viewBox = svgEl.getAttribute("viewBox");
    if (viewBox) {
      const [, , w, h] = viewBox.split(/\s+/).map(Number);
      if (!isNaN(w) && !isNaN(h)) {
        width = w;
        height = h;
      }
    }
  }

  // Last resort: client dimensions
  if (isNaN(width) || width === 0) width = svgEl.clientWidth;
  if (isNaN(height) || height === 0) height = svgEl.clientHeight;

  return { width, height };
}
