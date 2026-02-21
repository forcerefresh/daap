// const outlineStroke = require("svg-outline-stroke");
// const outlineStroke = require("svg-outline-stroke");

export function getClipMaskFromSvg(
  svgInput: string,
  clipMaskId: string,
  width: string,
  height: string,
) {
  const svg = svgInput; //await outlineStroke(svgInput);

  const svgEl = createElementFromHTML(svg) as SVGElement;

  const { width: svgWidth, height: svgHeight } = getSvgDimensions(svgEl);

  const scaleX = 1 / svgWidth;
  const scaleY = 1 / svgHeight;

  const svgClipMask = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  svgClipMask.setAttribute("width", "0");
  svgClipMask.setAttribute("height", "0");
  const clipRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "clipPath",
  );
  clipRect.setAttribute("id", clipMaskId);
  clipRect.setAttribute("clipPathUnits", "objectBoundingBox");
  svgClipMask.appendChild(clipRect);

  Array.from(svgEl.childNodes).forEach((child) => {
    if ("setAttribute" in child) {
      (child as SVGElement).setAttribute(
        "transform",
        `scale(${scaleX},${scaleY})`,
      );
    }
    clipRect.append(child);
  });

  return svgClipMask.outerHTML;

  //   return `
  //     <svg height="0" width="0" xmlns="http://www.w3.org/2000/svg">
  //       <defs>
  //         <clipPath id="${objectId}" clipPathUnits="objectBoundingBox">
  //           <path transform="scale(${scaleX},${scaleY})" d="M9 20h6v2H9zm7.906-6.288C17.936 12.506 19 11.259 19 9c0-3.859-3.141-7-7-7S5 5.141 5 9c0 2.285 1.067 3.528 2.101 4.73.358.418.729.851 1.084 1.349.144.206.38.996.591 1.921h-.792v2h8.032v-2h-.79c.213-.927.45-1.719.593-1.925.352-.503.726-.94 1.087-1.363z"/>
  //         </clipPath>
  //       </defs>
  //     </svg>
  //     `;
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
