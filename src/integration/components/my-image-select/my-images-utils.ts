import Resizer from "react-image-file-resizer";

export const resizeFile = (file: Blob, maxW = 300, maxH = 300, quality = 100) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      maxW,
      maxH,
      "JPEG",
      90,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });
