import Resizer from "react-image-file-resizer";

export const resizeFile = (file: Blob, maxW = 100, maxH = 100) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      maxW,
      maxH,
      "JPEG",
      70,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });
