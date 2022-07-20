const { app, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists, appendToFileName } = require("../../utils/utils");
const { v4: uuid } = require("uuid");
const sharp = require("sharp");

const {
  processImage,
  processVideo,
  processVector,
  type2Filename,
  type2MediaFolder,
} = require("./my-media-utils");
const { Console } = require("console");

ipcMain.on("getMediaSrc", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { type, mediaItem } = data;

  const userDataPath = app.getPath("userData");

  const myImagePath = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type),
    mediaItem.filename
  );

  const imageData = await fsPromise.readFile(myImagePath);
  const buff = Buffer.from(imageData);
  const base64 = buff.toString("base64");

  const mime =
    mediaItem.mediaType === "image"
      ? "image/jpg"
      : mediaItem.mediaType === "video"
      ? "video/mp4"
      : "";

  event.returnValue = {
    ...mediaItem,
    src: "data:" + mime + ";base64," + base64,
  };
});

ipcMain.handle("myMediaUpload", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const {
    fileBase64,
    fileMetadata,
    type,
    previewImageBase64,
    previewImageItem,
  } = data;

  console.log(fileMetadata);

  //const jsonFileName = `my-${type}s.json`;
  if (!fileMetadata.tags?.[0]) {
    fileMetadata.tags = [];
  }

  let myMedia = await loadMyMedia(type);

  // const data2 = await fetch(fileBase64).then((res) => res.blob());

  const userDataPath = app.getPath("userData");

  // create folders
  const myMediaDir = path.join(userDataPath, "my-media");
  if (!fs.existsSync(myMediaDir)) {
    fs.mkdirSync(myMediaDir);
  }
  const myMediaMediaDir = path.join(
    userDataPath,
    "my-media",
    type2MediaFolder(type)
  );
  if (!fs.existsSync(myMediaMediaDir)) {
    fs.mkdirSync(myMediaMediaDir);
  }

  // full media path
  let item;
  switch (type) {
    case "image": {
      item = await processImage(fileBase64, type, fileMetadata);
      break;
    }
    case "video": {
      item = await processVideo(
        fileBase64,
        type,
        fileMetadata,
        previewImageBase64,
        previewImageItem
      );
      break;
    }
    case "vector": {
      item = await processVector(fileBase64, type, fileMetadata);
      break;
    }
    default: {
      console.log(`Unknown media type: ${type}`);
    }
  }

  myMedia.unshift(item);

  saveMyMedia(type, myMedia);

  return { status: "OK" };
});

ipcMain.handle("myImagesFetchImages", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { from, tag, search, perPage, type } = data;

  let myMedia = await loadMyMedia(type);
  const totalItems = myMedia.length;

  if (tag) {
    myMedia = myMedia.filter(
      (image) => image.tags && image.tags.indexOf(tag) !== -1
    );
  }

  if (search) {
    myMedia = myMedia.filter((image) => image.title.indexOf(search) !== -1);
  }

  myMedia = myMedia.splice(from, perPage);

  return { data: myMedia, hasMore: from + perPage < totalItems };
});

async function loadMyMedia(type) {
  const myMediaPath = getMyMediaPath(type);

  const exist = await checkFileExists(myMediaPath);
  let myMedia = [];
  if (exist) {
    const myMediaStr = await fsPromise.readFile(myMediaPath, "utf-8");
    myMedia = JSON.parse(myMediaStr);
  }

  return myMedia;
}

async function saveMyMedia(type, data) {
  await fsPromise.writeFile(
    getMyMediaPath(type),
    JSON.stringify(data, undefined, 2)
  );
}

function getMyMediaPath(type) {
  const userDataPath = app.getPath("userData");
  const myImagesDir = path.join(userDataPath, "my-media");
  if (!fs.existsSync(myImagesDir)) {
    fs.mkdirSync(myImagesDir);
  }
  return path.join(userDataPath, "my-media", type2Filename(type));
}

function convertToBlob(base64image) {
  // convert base64 to raw binary data held in a string
  var byteString = atob(base64image.split(",")[1]);
  // separate out the mime component
  var mimeString = base64image.split(",")[0].split(":")[1].split(";")[0];
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var dw = new DataView(ab);
  for (var i = 0; i < byteString.length; i++) {
    dw.setUint8(i, byteString.charCodeAt(i));
    alert("arrived here");

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], {
      type: mimeString,
    });
  }
}
