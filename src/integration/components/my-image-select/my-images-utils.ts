import Resizer from "react-image-file-resizer";

export const resizeFile = (
  file: Blob,
  maxW = 300,
  maxH = 300,
  _quality = 100,
  type = "JPEG"
) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      maxW,
      maxH,
      type,
      90,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });
