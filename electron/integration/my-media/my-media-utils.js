const { app } = require("electron");
const path = require("path");
const fsPromise = require("fs/promises");
const { appendToFileName } = require("../../utils/utils");
const { v4: uuid } = require("uuid");
const sharp = require("sharp");

async function processImage(fileBase64, type, fileMetadata) {
  const userDataPath = app.getPath("userData");

  const myImagePath = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    fileMetadata.filename
  );
  const myImagePath80 = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_80")
  );
  const myImagePath150 = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_150")
  );
  const myImagePath300 = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_300")
  );

  const myImagePath600 = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_600")
  );

  const myImagePath900 = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_900")
  );

  const myImagePath1200 = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_1200")
  );

  const myImagePath1500 = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_1500")
  );
  // save image
  let base64Image = fileBase64.split(";base64,").pop();
  await fsPromise.writeFile(myImagePath, base64Image, { encoding: "base64" });

  // ********
  const thumbFile = await sharp(myImagePath)
    .resize({ width: 80 })
    .toFile(myImagePath80);
  const smallFile = await sharp(myImagePath)
    .resize({ width: 150 })
    .toFile(myImagePath150);
  const mediumFile = await sharp(myImagePath)
    .resize({ width: 300 })
    .toFile(myImagePath300);
  const largeFile = await sharp(myImagePath)
    .resize({ width: 600 })
    .toFile(myImagePath600);
  const xlargeFile = await sharp(myImagePath)
    .resize({ width: 900 })
    .toFile(myImagePath900);
  const xxlargeFile = await sharp(myImagePath)
    .resize({ width: 1200 })
    .toFile(myImagePath1200);
  const xxxlargeFile = await sharp(myImagePath)
    .resize({ width: 1500 })
    .toFile(myImagePath1500);

  const item = {
    id: uuid(),
    ...fileMetadata,
    images: {
      thumbnail: {
        filename: "file:" + appendToFileName(fileMetadata.filename, "_80"),
        mediaType: "image",
        sourceType: "local",
        sizeType: "thumbnail",
        size: {
          width: 80,
          height: await (await sharp(myImagePath80).metadata()).height,
          type: "jpg",
        },
      },
      small: {
        filename: "file:" + appendToFileName(fileMetadata.filename, "_150"),
        mediaType: "image",
        sourceType: "local",
        sizeType: "small",
        size: {
          width: 150,
          height: await (await sharp(myImagePath150).metadata()).height,
          type: "jpg",
        },
      },
      medium: {
        filename: "file:" + appendToFileName(fileMetadata.filename, "_300"),
        mediaType: "image",
        sourceType: "local",
        sizeType: "medium",
        size: {
          width: 300,
          height: await (await sharp(myImagePath300).metadata()).height,
          type: "jpg",
        },
      },

      large: {
        filename: "file:" + appendToFileName(fileMetadata.filename, "_600"),
        mediaType: "image",
        sourceType: "local",
        sizeType: "large",
        size: {
          width: 600,
          height: await (await sharp(myImagePath600).metadata()).height,
          type: "jpg",
        },
      },
      xlarge: {
        filename: "file:" + appendToFileName(fileMetadata.filename, "_900"),
        mediaType: "image",
        sourceType: "local",
        sizeType: "xlarge",
        size: {
          width: 900,
          height: await (await sharp(myImagePath900).metadata()).height,
          type: "jpg",
        },
      },
      xxlarge: {
        filename: "file:" + appendToFileName(fileMetadata.filename, "_1200"),
        mediaType: "image",
        sourceType: "local",
        sizeType: "xxlarge",
        size: {
          width: 1200,
          height: await (await sharp(myImagePath1200).metadata()).height,
          type: "jpg",
        },
      },
      xxxlarge: {
        filename: "file:" + appendToFileName(fileMetadata.filename, "_1500"),
        mediaType: "image",
        sourceType: "local",
        sizeType: "xxxlarge",
        size: {
          width: 1500,
          height: await (await sharp(myImagePath1500).metadata()).height,
          type: "jpg",
        },
      },
      original: {
        filename: "file:" + fileMetadata.filename,
        mediaType: "image",
        sourceType: "local",
        sizeType: "original",
        size: {
          width: await (await sharp(myImagePath).metadata()).width,
          height: await (await sharp(myImagePath).metadata()).height,
          type: "jpg",
        },
      },
    },
  };

  return item;
}

function type2Filename(type) {
  return `my-${type}s.json`;
}

function type2MediaFolder(type) {
  return `my-${type}s`;
}

module.exports = {
  processImage,
  type2Filename,
  type2MediaFolder,
};
