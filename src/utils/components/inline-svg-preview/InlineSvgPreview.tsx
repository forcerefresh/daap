import React from "react";

function getSvgNaturalSize(
  svgString: string,
  fallbackW: number,
  fallbackH: number,
): { w: number; h: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) return { w: fallbackW, h: fallbackH };

  const viewBox = svgEl.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length >= 4) {
      return { w: parts[2] || fallbackW, h: parts[3] || fallbackH };
    }
  }

  const wAttr = parseFloat(svgEl.getAttribute("width") ?? "");
  const hAttr = parseFloat(svgEl.getAttribute("height") ?? "");
  return {
    w: !isNaN(wAttr) ? wAttr : fallbackW,
    h: !isNaN(hAttr) ? hAttr : fallbackH,
  };
}

export function renderInlineSvgPreview(
  inlineSvgPreview: string,
  containerW: number,
  containerH: number,
): React.ReactElement {
  const { w: svgW, h: svgH } = getSvgNaturalSize(
    inlineSvgPreview,
    containerW,
    containerH,
  );
  const scale = Math.min(containerW / svgW, containerH / svgH);

  return (
    <div
      style={{
        width: containerW,
        height: containerH,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: svgW,
          height: svgH,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
        dangerouslySetInnerHTML={{ __html: inlineSvgPreview }}
      />
    </div>
  );
}
