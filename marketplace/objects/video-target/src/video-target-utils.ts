//adjust aspect ratio between video and canvas element

export function calculateSize(
  fitMode: string,
  videoW: number,
  videoH: number,
  canvasW: number,
  canvasH: number
) {
  const canvasR = canvasW / canvasH;
  const videoR = videoW / videoH;
  switch (fitMode) {
    case "fill":
      return {
        x: 0,
        y: 0,
        width: canvasW,
        height: canvasH,
      };
    case "contain":
      if (videoR > canvasR) {
        return {
          x: 0,
          y: (canvasH - canvasW / videoR) / 2,
          width: canvasW,
          height: canvasW / videoR,
        };
      } else {
        return {
          x: (canvasW - canvasH * videoR) / 2,
          y: 0,
          width: canvasH * videoR,
          height: canvasH,
        };
      }
    case "cover":
      if (videoR < canvasR) {
        return {
          x: 0,
          y: (canvasH - canvasW / videoR) / 2,
          width: canvasW,
          height: canvasW / videoR,
        };
      } else {
        return {
          x: (canvasW - canvasH * videoR) / 2,
          y: 0,
          width: canvasH * videoR,
          height: canvasH,
        };
      }
  }
}
