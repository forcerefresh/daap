const { app } = require("electron");
const path = require("path");
const fsPromise = require("fs/promises");
const {
  appendToFileName,
  fileToBuffer,
  writeFileWithPath,
  checkFileExists,
  getMyImagesPath,
  getMyVideosPath,
} = require("../../utils/utils");
const { v4: uuid } = require("uuid");
const sharp = require("sharp");
const JSZip = require("jszip");
const fs = require("fs");
const { omit } = require("lodash");

async function processVideo(
  fileBase64,
  type,
  fileMetadata,
  previewImageBase64,
  previewImageItem
) {
  const userDataPath = app.getPath("userData");

  const myVideoPath = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    fileMetadata.filename
  );

  // save image
  let base64Image = fileBase64.split(";base64,").pop();
  await fsPromise.writeFile(myVideoPath, base64Image, { encoding: "base64" });

  // save original preview image
  const myPreviewImagePath = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    fileMetadata.filename + ".jpg"
  );
  let base64PreviewImage = previewImageBase64.split(";base64,").pop();
  await fsPromise.writeFile(myPreviewImagePath, base64PreviewImage, {
    encoding: "base64",
  });

  // genereate small for preview
  const myPreviewImagePath150 = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename + ".jpg", "_150")
  );
  await sharp(myPreviewImagePath)
    .resize({ width: 150 })
    .toFile(myPreviewImagePath150);

  //const { blob, videoItem } = await getImageFromFile(file);

  const id = uuid();

  const item = {
    id,
    ...fileMetadata,
    videos: {
      original: {
        id,
        filename: fileMetadata.filename,
        mediaType: "video",
        sourceType: "local",
        sizeType: "original",
        size: {
          width: previewImageItem.size.width,
          height: previewImageItem.size.height,
          type: "mp4",
        },
      },
    },
    images: {
      original: {
        id,
        filename: fileMetadata.filename + ".jpg",
        mediaType: "image",
        sourceType: "local",
        sizeType: "original",
        size: {
          width: await (await sharp(myPreviewImagePath).metadata()).width,
          height: await (await sharp(myPreviewImagePath).metadata()).height,
          type: "jpg",
        },
      },
      small: {
        id,
        filename: appendToFileName(fileMetadata.filename + ".jpg", "_150"),
        mediaType: "image",
        sourceType: "local",
        sizeType: "original",
        size: {
          width: await (await sharp(myPreviewImagePath150).metadata()).width,
          height: await (await sharp(myPreviewImagePath150).metadata()).height,
          type: "jpg",
        },
      },
    },
  };
  return item;
}

async function deleteExtensions(extensionsArr) {
  const deleteExtensionsResponse = [];

  const userDataPath = app.getPath("userData");

  console.log(extensionsArr);
  for (let i = 0; i < extensionsArr.length; i++) {
    const ext = extensionsArr[i];

    try {
      const extensionZipPath = path.join(
        userDataPath,
        "my-uploads",
        type2MediaFolder("extension"),
        ext.packageFilename
      );

      //console.log(extensionZipPath);
      fs.rmSync(extensionZipPath);

      const extensionDir = path.join(
        userDataPath,
        "my-uploads",
        type2MediaFolder("extension"),
        ext.type
      );

      //console.log(extensionDir);
      fs.rmSync(extensionDir, { recursive: true, force: true });

      deleteExtensionsResponse.push({ status: "SUCCESS", id: ext.id });
    } catch (ex) {
      console.log(ex);
      deleteExtensionsResponse.push({ status: "ERROR", id: ext.id });
    }
  }

  console.log(deleteExtensionsResponse);

  return deleteExtensionsResponse;
}

function findAssetMediaType(assetsUrls, assetFileName) {
  return assetsUrls.find((item) => item.localFilename === assetFileName)
    ?.mediaType;
}

async function processTemplate(fileBase64, type, fileMetadata) {
  // use temporary id for zip and folder
  const tempId = uuid();

  const userDataPath = app.getPath("userData");
  const myTmpTemplateZipPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    tempId + ".zip"
  );

  let base64Zip = fileBase64.split(";base64,").pop();
  await fsPromise.writeFile(myTmpTemplateZipPath, base64Zip, {
    encoding: "base64",
  });

  // create temp folder >>
  const myTmpTemplateDirPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    tempId
  );
  await fsPromise.mkdir(myTmpTemplateDirPath);
  // create temp folder <<

  // unzip >>
  let zip = new JSZip();
  const zipPackage = await fileToBuffer(myTmpTemplateZipPath);
  zip = await zip.loadAsync(zipPackage);

  const fileNames = Object.keys(zip.files);
  console.log(fileNames);
  for (let i = 0; i < fileNames.length; i++) {
    const zipFilePath = fileNames[i];
    if (!zip.file(zipFilePath)) {
      continue;
    }
    const content = await zip.files[zipFilePath].async("nodebuffer");
    var dest = path.join(myTmpTemplateDirPath, fileNames[i]);
    console.log(dest);
    await writeFileWithPath(dest, content);
  }
  // unzip <<

  // get template data >>
  const projectJsonPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    tempId,
    "project.json"
  );

  const projectStr = await fsPromise.readFile(projectJsonPath, "utf-8");
  const project = JSON.parse(projectStr);

  // get template data <<

  // check if template exist >>
  const templateId = project.id;
  const myTemplateZipPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    templateId + ".zip"
  );
  const templateExist = await checkFileExists(myTemplateZipPath);
  console.log(templateExist);
  console.log(templateId);

  if (templateExist) {
    return false;
  }
  // check if template exist <<

  // rename >>
  const myTemplateDirPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    templateId
  );
  await fsPromise.rename(myTmpTemplateZipPath, myTemplateZipPath);
  await fsPromise.rename(myTmpTemplateDirPath, myTemplateDirPath);
  // rename <<

  // copy assets >>
  const assetsPath = path.join(myTemplateDirPath, "assets");
  const assetFiles = await fsPromise.readdir(assetsPath, {
    withFileTypes: true,
  });
  const assetFileNames = assetFiles
    .filter((item) => !item.isDirectory())
    .map((item) => item.name);
  console.log(assetFileNames);

  const imageItems = [];
  const videoItems = [];
  for (let i = 0; i < assetFileNames.length; i++) {
    const assetFileName = assetFileNames[i];
    const mediaType = findAssetMediaType(project.assetsUrls, assetFileName);
    const fromAssetPath = path.join(assetsPath, assetFileName);

    if (mediaType === "image") {
      const metaData = {
        title: path.parse(assetFileName).name,
        filename: assetFileName,
        tags: [templateId],
      };

      const assetBase64 = (await fsPromise.readFile(fromAssetPath)).toString(
        "base64"
      );

      const imageItem = await processImage(assetBase64, "image", metaData);
      imageItems.push(imageItem);
    }

    if (mediaType === "video") {
      const metaData = {
        title: path.parse(assetFileName).name,
        filename: assetFileName,
        tags: [templateId],
      };

      const assetBase64 = (await fsPromise.readFile(fromAssetPath)).toString(
        "base64"
      );

      const videoItem = await processVideo(
        assetBase64,
        "video",
        metaData,
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        { size: { width: "0", height: "0" } }
      );
      imageItems.push(videoItem);
    }

    console.log(imageItems);

    // console.log(mediaType);
    // console.log(path.join(assetsPath, assetFileName));
    // console.log(path.join(getMyImagesPath(), assetFileName));

    // const assetRoot =
    //   mediaType === "video"
    //     ? getMyVideosPath()
    //     : mediaType === "image"
    //     ? getMyImagesPath()
    //     : undefined;

    // console.log(assetRoot);

    // if (assetRoot) {
    //   await fsPromise.copyFile(
    //     path.join(assetsPath, assetFileName),
    //     path.join(assetRoot, assetFileName)
    //   );

    //   if (mediaType === "image") {
    //     imageItems.push(createImageItem(assetFileName, templateId));
    //   }
    //   if (mediaType === "video") {
    //     //imageItems.push(createVideoItem(assetFileName, templateId))
    //   }
    // }
  }

  let myMedia = await loadMyMedia("image");
  // NOTE: consider removing if we create at startup
  createMyMediaFolder(type);
  saveMyMedia("image", [...myMedia, ...imageItems]);

  // add asset

  // add asset item >>
  // const mediaItem = {
  //   id: "fe326a37-0fd6-4ee8-aa16-9b7d1c821e15",
  //   tags: [templateId],
  //   title: "",
  //   filename: assetFileName",
  //   "images": {
  //     "original": {
  //       "id": "fe326a37-0fd6-4ee8-aa16-9b7d1c821e15",
  //       "filename": assetFileName,
  //       "mediaType": "image",
  //       "sourceType": "local",
  //       "sizeType": "original",
  //       "size": {
  //         "width": 5184,
  //         "height": 3456,
  //         "type": "jpg"
  //       }
  //     }
  //   }
  // };
  // add asset item <<

  // copy assets <<

  return omit(project, "project");
}

async function processExtension(fileBase64, type, fileMetadata) {
  const userDataPath = app.getPath("userData");

  const extensionZipPath = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    fileMetadata.filename
  );

  // save extension
  let base64Zip = fileBase64.split(";base64,").pop();
  await fsPromise.writeFile(extensionZipPath, base64Zip, {
    encoding: "base64",
  });

  let zip = new JSZip();
  const zipPackage = await fileToBuffer(extensionZipPath);
  zip = await zip.loadAsync(zipPackage);

  const zipMetaFile =
    zip.files["object-meta.json"] || zip.files["effect-meta.json"];
  const content = await zipMetaFile.async("nodebuffer");
  console.log(content);
  const objectMeta = JSON.parse(content);
  console.log(objectMeta);

  const extensionDir = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    objectMeta.type
  );

  if (!fs.existsSync(extensionDir)) {
    fs.mkdirSync(extensionDir);
  }

  const fileNames = Object.keys(zip.files);
  for (let i = 0; i < fileNames.length; i++) {
    const content = await zip.files[fileNames[i]].async("nodebuffer");
    var dest = path.join(extensionDir, fileNames[i]);
    await fsPromise.writeFile(dest, content);
  }
  const id = uuid();

  return { id, ...objectMeta, packageFilename: fileMetadata.filename };
}

async function deleteMedia(imagesArr, type = "image") {
  const deleteImagesResponse = [];

  const userDataPath = app.getPath("userData");

  console.log(imagesArr);
  for (let i = 0; i < imagesArr.length; i++) {
    const img = imagesArr[i];

    const filesToDel = [];

    filesToDel.push(img.filename);

    console.log(filesToDel);

    if (img.images) {
      Object.values(img.images).forEach((imgObj) => {
        filesToDel.push(imgObj.filename);
      });
    }

    try {
      for (let j = 0; j < filesToDel.length; j++) {
        if (filesToDel[j]) {
          const imagePath = path.join(
            userDataPath,
            "my-uploads",
            type2MediaFolder(type),
            filesToDel[j]
          );

          if (fs.existsSync(imagePath)) {
            try {
              fs.rmSync(imagePath, { force: true });
            } catch (ex) {}
          }
        }
      }

      deleteImagesResponse.push({ status: "SUCCESS", id: img.id });
    } catch (ex) {
      deleteImagesResponse.push({ status: "ERROR", id: img.id });
    }
  }

  return deleteImagesResponse;
}

async function processImage(fileBase64, type, fileMetadata) {
  const userDataPath = app.getPath("userData");

  const myImagePath = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    fileMetadata.filename
  );
  const myImagePath80 = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_80")
  );
  const myImagePath150 = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_150")
  );
  const myImagePath300 = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_300")
  );

  const myImagePath600 = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_600")
  );

  const myImagePath900 = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_900")
  );

  const myImagePath1200 = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    appendToFileName(fileMetadata.filename, "_1200")
  );

  const myImagePath1500 = path.join(
    userDataPath,
    "my-uploads",
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

  const id = uuid();
  const item = {
    id,
    ...fileMetadata,
    images: {
      thumbnail: {
        id,
        filename: appendToFileName(fileMetadata.filename, "_80"),
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
        id,
        filename: appendToFileName(fileMetadata.filename, "_150"),
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
        id,
        filename: appendToFileName(fileMetadata.filename, "_300"),
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
        id,
        filename: appendToFileName(fileMetadata.filename, "_600"),
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
        id,
        filename: appendToFileName(fileMetadata.filename, "_900"),
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
        id,
        filename: appendToFileName(fileMetadata.filename, "_1200"),
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
        id,
        filename: appendToFileName(fileMetadata.filename, "_1500"),
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
        id,
        filename: fileMetadata.filename,
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

async function processVector(fileBase64, type, fileMetadata) {
  const userDataPath = app.getPath("userData");

  const myImagePath = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type),
    fileMetadata.filename
  );

  // save image
  let base64Image = fileBase64.split(";base64,").pop();
  await fsPromise.writeFile(myImagePath, base64Image, { encoding: "base64" });

  const id = uuid();
  const item = {
    id,
    ...fileMetadata,
    svgString: await fsPromise.readFile(myImagePath, "utf-8"),
  };

  return item;
}

function type2Filename(type) {
  return `my-${type}s.json`;
}

function type2MediaFolder(type) {
  return `my-${type}s`;
}

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
  const myImagesDir = path.join(userDataPath, "my-uploads");
  if (!fs.existsSync(myImagesDir)) {
    fs.mkdirSync(myImagesDir);
  }
  return path.join(userDataPath, "my-uploads", type2Filename(type));
}

function createMyMediaFolder(type) {
  const userDataPath = app.getPath("userData");

  const myMediaDir = path.join(userDataPath, "my-uploads");
  if (!fs.existsSync(myMediaDir)) {
    fs.mkdirSync(myMediaDir);
  }
  const myMediaMediaDir = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder(type)
  );
  if (!fs.existsSync(myMediaMediaDir)) {
    fs.mkdirSync(myMediaMediaDir);
  }
}

module.exports = {
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
};
