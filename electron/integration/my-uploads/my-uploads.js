const { app, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists, appendToFileName } = require("../../utils/utils");
const { v4: uuid } = require("uuid");
const sharp = require("sharp");

const {
  processImage,
  deleteMedia,
  processVideo,
  processVector,
  processExtension,
  processTemplate,
  deleteExtensions,
  type2Filename,
  type2MediaFolder,
  loadMyMedia,
  saveMyMedia,
  createMyMediaFolder,
} = require("./my-uploads-utils");

// API handlers

ipcMain.handle("MyUploads::Delete", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { type, ids } = data;

  let response = []; /* { status: "SUCCESS" | "ERROR", id: string}[]*/

  const myMedia = await loadMyMedia(type);

  const newMyMedia = myMedia.filter((media) => ids.indexOf(media.id) === -1);
  const delMyMedia = myMedia.filter((media) => ids.indexOf(media.id) !== -1);

  switch (type) {
    case "image": {
      response = await deleteMedia(delMyMedia);
      break;
    }
    case "video": {
      response = await deleteMedia(delMyMedia, type);
      break;
    }
    case "vector": {
      response = await deleteMedia(delMyMedia, type);
      break;
    }
    case "extension": {
      response = await deleteExtensions(delMyMedia);
      break;
    }
    default: {
      console.log(`Unknown media type to delete: ${type}`);
    }
  }

  saveMyMedia(type, newMyMedia);

  return { response };
});

ipcMain.on("MyUploads::GetMediaSrc", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { type, mediaItem } = data;

  const relativePath = [
    "my-uploads",
    type2MediaFolder(type),
    mediaItem.filename,
  ].join("/");

  event.returnValue = {
    ...mediaItem,
    src: "webslider-fp://" + relativePath,
  };

  return;

  // const userDataPath = app.getPath("userData");

  // const myImagePath = path.join(
  //   userDataPath,
  //   "my-uploads",
  //   type2MediaFolder(type),
  //   mediaItem.filename
  // );

  // let base64 = "";
  // try {
  //   const imageData = await fsPromise.readFile(myImagePath);
  //   const buff = Buffer.from(imageData);
  //   base64 = buff.toString("base64");
  // } catch {
  //   console.log("File not found: " + myImagePath);
  // }

  // const mime =
  //   mediaItem.mediaType === "image"
  //     ? "image/jpg"
  //     : mediaItem.mediaType === "video"
  //     ? "video/mp4"
  //     : "";

  // event.returnValue = {
  //   ...mediaItem,
  //   src: "data:" + mime + ";base64," + base64,
  // };
});

ipcMain.handle("MyUploads::Upload", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const {
    fileBase64,
    fileMetadata,
    type,
    previewImageBase64,
    previewImageItem,
  } = data;

  if (!fileMetadata.tags?.[0]) {
    fileMetadata.tags = [];
  }

  let myMedia = await loadMyMedia(type);

  // create folders
  createMyMediaFolder(type);

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
    case "extension": {
      item = await processExtension(fileBase64, type, fileMetadata);
      break;
    }
    case "template": {
      item = await processTemplate(fileBase64, type, fileMetadata);
      break;
    }
    default: {
      console.log(`Unknown media type: ${type}`);
    }
  }

  if (!item) {
    return {
      status: "ERROR",
      errorMessage: "Template with same id already exist",
    };
  }

  // NOTE: order - exception for template
  if (type === "template") {
    myMedia.push(item);
  } else {
    myMedia.unshift(item);
  }

  saveMyMedia(type, myMedia);

  return { status: "OK" };
});

ipcMain.handle("MyUploads::Fetch", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { from, tags, search, perPage, type } = data;

  let myMedia = await loadMyMedia(type);
  const totalItems = myMedia.length;

  if (tags[0]) {
    myMedia = myMedia.filter(
      (image) => image.tags && image.tags.indexOf(tags[0]) !== -1
    );
  }

  if (search) {
    if (type === "extension") {
      myMedia = myMedia.filter(
        (image) =>
          (image.name || "").toLowerCase().indexOf(search.toLowerCase()) !== -1
      );
    } else {
      myMedia = myMedia.filter(
        (image) =>
          (image.title &&
            image.title.toLowerCase().indexOf(search.toLowerCase()) !== -1) ||
          (image.filename &&
            image.filename.toLowerCase().indexOf(search.toLowerCase()) !== -1)
      );
    }
  }

  console.log(myMedia);
  myMedia = myMedia.splice(from, perPage);

  if (type === "extension") {
    for (let i = 0; i < myMedia.length; i++) {
      const userDataPath = app.getPath("userData");
      const iconPath = path.join(
        userDataPath,
        "my-uploads",
        type2MediaFolder(type),
        myMedia[i].type,
        myMedia[i].packageFiles.icon
      );

      const svgData = await fsPromise.readFile(iconPath, { encoding: "utf8" });
      // const buff = Buffer.from(svgData);
      myMedia[i].logoUrl = svgData; //buff.toString("base64");
    }

    // add images
  }
  return { data: myMedia, hasMore: from + perPage < totalItems };
});

// supporting functions

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
