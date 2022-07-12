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

  console.log(myImagePath);

  const imageData = await fsPromise.readFile(myImagePath);
  const buff = Buffer.from(imageData);
  const base64 = buff.toString("base64");

  const mime =
    type === "image" ? "image/png" : type === "video" ? "video/mp4" : "";
  event.returnValue = {
    ...mediaItem,
    src: "data:" + mime + ";base64," + base64,
  };

  //return { ...mediaItem, src: "data:image/png;base64," + base64 };

  //console.log(mediaItem);
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

  //const jsonFileName = `my-${type}s.json`;
  if (!fileMetadata.tags?.[0]) {
    fileMetadata.tags = [];
  }

  console.log(fileMetadata);
  console.log(type);

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
    }
    case "video": {
      item = await processVideo(
        fileBase64,
        type,
        fileMetadata,
        previewImageBase64,
        previewImageItem
      );
    }
  }

  //*****

  // add to json
  myMedia.unshift(item);

  saveMyMedia(type, myMedia);
  /// const data2 = convertToBlob(fileBase64);
  //console.log(fileBase64);

  /// KOD IZ BROWSER ............
  // ...............................

  /*
  let item; // ImageData | VectorData | VideoData | ExtesnsionData;

  switch (type) {
    case "image": {
      const thumbFile = await resizeFile(file, 80, 80, 70);
      const smallFile = await resizeFile(file, 120, 120, 70);
      const mediumFile = await resizeFile(file, 300, 300, 70);

      item = {
        id: uuid(),
        ...fileMetadata,
        images: {
          original: {
            url: thumbFile as string,
            size: { width: 80, height: 80, type: "jpg" },
          },
          small: {
            url: smallFile as string,
            size: { width: 120, height: 120, type: "jpg" },
          },
          medium: {
            url: mediumFile as string,
            size: { width: 300, height: 300, type: "jpg" },
          },
        },
      };
      break;
    }
    case "video": {
      const { blob, videoItem } = await getImageFromFile(file);
      console.log(blob);
      const thumbFile = await resizeFile(blob!, 80, 80, 70);
      const smallFile = await resizeFile(blob!, 120, 120, 70);
      const mediumFile = await resizeFile(blob!, 300, 300, 70);
      videoItem.url = await file2Base64(file);

      item = {
        id: uuid(),
        ...fileMetadata,
        videos: {
          original: videoItem,
        },
        images: {
          thumbnail: {
            url: thumbFile as string,
            size: { width: 80, height: 80, type: "jpg" },
          },
          small: {
            url: smallFile as string,
            size: { width: 120, height: 120, type: "jpg" },
          },
          medium: {
            url: mediumFile as string,
            size: { width: 300, height: 300, type: "jpg" },
          },
        },
      };
      break;
    }
    case "vector": {
      item = {
        id: uuid(),
        ...fileMetadata,
        svgString: await file.text(),
      };
      break;
    }
    case "extension": {
      item = {
        id: uuid(),
        ...fileMetadata,
        file: "file",
        // no sense to save extension in local storafe. elestorn only impl.
      };
      break;
    }
  }

  myImages.unshift(item);

  localStorage.setItem(lsKey, JSON.stringify(myImages));

  setTimeout(() => {
    resolve({ status: "OK" });
  }, 1);



*/

  return { status: "OK" };
});

ipcMain.handle("myImagesFetchImages", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { from, tag, search, perPage, type } = data;

  let myMedia = await loadMyMedia(type);
  const totalItems = myMedia.length;

  console.log(from);
  console.log(perPage);
  console.log(totalItems);

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
