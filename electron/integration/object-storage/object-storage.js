const fetch = require("node-fetch");
var mime = require("mime-types");
const { app, BrowserWindow, ipcMain } = require("electron");
var url = require("url");
var path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { forEach, remove } = require("lodash");
const {
  checkFileExists,
  getPlayerPath,
  getBucketPreviewPath,
  downloadToBuffer,
  getMyImagesPath,
  getMyVideosPath,
  fileToBuffer,
} = require("../../utils/utils");
const {
  loadProject,
  loadExport,
} = require("../../integration/project/project-utils");
const { v4: uuid } = require("uuid");
const AWS = require("aws-sdk");
const { omit, without, chunk } = require("lodash");
const keytar = require("keytar");
const cloneDeep = require("clone-deep");
var JSZip = require("jszip");
const {
  getBucketManagerClass,
} = require("../../bucket-managers/bucket-manager-factory");
const { info, debug } = require("../../utils/logger");

const PARALLEL_UPLOAD = 5; // for publish (download and upload)
const PARALLEL_DOWNLOAD = 5; // for download

ipcMain.handle("ObjectStorage::List", async (event, reqJson) => {
  debug("Handle ObjectStorage::List");

  const req = JSON.parse(reqJson);

  let objectStorageList = await loadObjectStorage();

  if (req.projectId) {
    objectStorageList = objectStorageList.map((bucket) => {
      const ret = cloneDeep(bucket);

      ret.assignedProject = (bucket.assignedProjects || []).find(
        (item) => item.projectId === req.projectId
      );
      delete ret.assignedProjects;
      return ret;
    });
  }
  return objectStorageList.map((item) => omit(item, "secretKey"));
});

ipcMain.handle("ObjectStorage::ListAssigned", async (event, reqJson) => {
  debug("Handle ObjectStorage::ListAssigned");

  const req = JSON.parse(reqJson);

  let objectStorageList = await loadObjectStorage();

  if (req.projectId) {
    objectStorageList = objectStorageList.map((bucket) => {
      const ret = cloneDeep(bucket);

      ret.assignedProject = (bucket.assignedProjects || []).find(
        (item) => item.projectId === req.projectId
      );

      if (!ret.assignedProject) return undefined;

      delete ret.assignedProjects;
      return ret;
    });

    objectStorageList = without(objectStorageList, undefined);
  }

  return objectStorageList.map((item) => omit(item, "secretKey"));
});

ipcMain.handle("ObjectStorage::Add", async (event, reqJson) => {
  debug("Handle ObjectStorage::Add");

  const item = JSON.parse(reqJson);
  item.id = uuid();

  try {
    await keytar.setPassword(
      "wsSliderAppBucketKey",
      item.platform + "_" + item.bucketName,
      item.secretKey
    );
    delete item.secretKey;
  } catch (ex) {
    console.log(ex);
  }

  const objectStorageList = await loadObjectStorage();
  objectStorageList.push(item);

  await saveObjectStorage(objectStorageList);

  return item;
});

ipcMain.handle("ObjectStorage::Delete", async (event, reqJson) => {
  debug("Handle ObjectStorage::Delete");

  const req = JSON.parse(reqJson);

  const objectStorageList = await loadObjectStorage();

  const deletedItem = remove(objectStorageList, (item) => item.id === req.id);

  await saveObjectStorage(objectStorageList);

  return { id: deletedItem.id };
});

ipcMain.handle("ObjectStorage::UploadPlayer", async (event, reqJson) => {
  debug("Handle ObjectStorage::UploadPlayer");

  const req = JSON.parse(reqJson);

  const objectStorageList = await loadObjectStorage();

  const bucket = objectStorageList.find((item) => item.id === req.id);

  const files = await getPlayerFiles();

  const secretKey = await keytar.getPassword(
    "wsSliderAppBucketKey",
    bucket.platform + "_" + bucket.bucketName
  );

  const ManagerClass = getBucketManagerClass(bucket.platform);
  const bucketManager = new ManagerClass({
    ...bucket,
    secretKey,
  });

  let error = null;
  for (const file of files) {
    if (file === ".DS_Store") continue;

    try {
      await bucketManager.uploadFileToBucket(
        bucket,
        path.join(getPlayerPath(), file),
        `wsplayer/${app.getVersion()}/${file}`
      );
    } catch (ex) {
      error = ex.toString();
      break;
    }
  }

  if (error) {
    return { status: "ERROR", error };
  }

  bucket.playerStatus = "uploaded";

  await saveObjectStorage(objectStorageList);

  return { status: "OK" };
});

ipcMain.handle("ObjectStorage::Get", async (event, reqJson) => {
  debug("Handle ObjectStorage::Get");

  const req = JSON.parse(reqJson);

  return {};
});

ipcMain.handle(
  "ObjectStorage::RemoveBucketFromProject",
  async (event, reqJson) => {
    debug("Handle ObjectStorage::RemoveBucketFromProject");

    const req = JSON.parse(reqJson);

    const objectStorageList = await loadObjectStorage();

    const item = objectStorageList.find((item) => item.id === req.bucketId);

    if (!item.assignedProjects) {
      return {
        status: "ERROR",
        error: "Project is not assigned to bucket",
      };
    }

    // assign if not assigned
    const assignedProject = item.assignedProjects.find(
      (item) => item.projectId === req.projectId
    );
    if (!assignedProject) {
      return {
        status: "ERROR",
        error: "Project is not assigned to bucket",
      };
    } else {
      remove(item.assignedProjects, (item) => item.projectId === req.projectId);
    }

    await saveObjectStorage(objectStorageList);

    return { status: "OK" };
  }
);

ipcMain.handle(
  "ObjectStorage::AssignBucketToProject",
  async (event, reqJson) => {
    debug("Handle ObjectStorage::AssignBucketToProject");

    const req = JSON.parse(reqJson);

    const objectStorageList = await loadObjectStorage();

    const item = objectStorageList.find((item) => item.id === req.bucketId);

    if (!item.assignedProjects) {
      item.assignedProjects = [];
    }

    // assign if not assigned
    const assignedProject = item.assignedProjects.find(
      (item) => item.projectId === req.projectId
    );
    if (!assignedProject) {
      item.assignedProjects.push({ projectId: req.projectId });
    } else {
      return {
        status: "ERROR",
        error: "Project is already assigned to bucket",
      };
    }

    await saveObjectStorage(objectStorageList);

    return { status: "OK" };
  }
);

ipcMain.handle("ObjectStorage::GetAssignedBuckets", async (event, reqJson) => {
  debug("Handle ObjectStorage::GetAssignedBuckets");

  const req = JSON.parse(reqJson);

  const objectStorageList = await loadObjectStorage();

  const filtered = objectStorageList.filter(
    (bucket) =>
      bucket.assignedProjects &&
      bucket.assignedProjects.find(
        (assignedProject) => assignedProject.projectId === req.projectId
      )
  );

  return filtered.map((bucket) => bucket.id);
});

ipcMain.handle("ObjectStorage::Publish", async (event, reqJson) => {
  debug("Handle ObjectStorage::Publish");

  const req = JSON.parse(reqJson);

  const objectStorageList = await loadObjectStorage();
  const bucket = objectStorageList.find((item) => item.id === req.bucketId);

  debug(bucket);

  if (!bucket.assignedProjects) {
    return { status: "ERROR", error: "Bucket is not assigned to this project" };
  }

  // assign if not assigned
  const assignedProject = bucket.assignedProjects.find(
    (item) => item.projectId === req.projectId
  );
  if (!assignedProject) {
    return {
      status: "ERROR",
      error: "Bucket is not assigned to this project (2)",
    };
  }

  // NODE: bucketWithKeys use only for upload
  const bucketWithKeys = await getBucketWithKeys(req.bucketId);
  const ManagerClass = getBucketManagerClass(bucketWithKeys.platform);
  const bucketManager = new ManagerClass(bucketWithKeys);

  // get publish urls >>
  const publishDetails = await bucketManager.getPublishDetails(
    bucket,
    req.projectId
  );
  // get publish urls <<

  // TODO
  const project = await loadProject(req.projectId);

  // upload assets >>
  const assetsUrlsChunks = chunk(project.assetsUrls, PARALLEL_UPLOAD);

  BrowserWindow.getAllWindows()[0].webContents.send(
    `ObjectStorageRenderer::SubscribeToPublishDetails`,
    JSON.stringify([{ log: "Publish started" }])
  );

  let error;
  let uploadResult = [];
  for (const assetsUrlsChunk of assetsUrlsChunks) {
    const pArr = [];
    for (const assetItem of assetsUrlsChunk) {
      if (assetItem.sourceType === "library") {
        var parsed = url.parse(assetItem.url);
        let filename = path.basename(parsed.pathname);
        //const extension = filename.substring(filename.indexOf("."));
        if (assetItem.filename) {
          filename = assetItem.filename; // + extension;
        }
        pArr.push(
          bucketManager.uploadUrlToBucket(
            bucketWithKeys,
            assetItem.url,
            `${req.projectId}/assets/${filename}`
          )
        );
      }
      if (assetItem.sourceType === "local") {
        let filename = assetItem.localFilename;
        if (assetItem.filename) {
          filename = assetItem.filename;
        }
        const mediaPath =
          assetItem.mediaType === "video"
            ? getMyVideosPath()
            : getMyImagesPath();

        pArr.push(
          bucketManager.uploadFileToBucket(
            bucketWithKeys,
            path.join(mediaPath, assetItem.localFilename),
            `${req.projectId}/assets/${filename}`
          )
        );
      }
    }

    try {
      const result = await Promise.all(pArr);
      BrowserWindow.getAllWindows()[0].webContents.send(
        `ObjectStorageRenderer::SubscribeToPublishDetails`,
        JSON.stringify(result)
      );

      uploadResult = [...uploadResult, ...result];
    } catch (ex) {
      console.log(ex);
      error = ex.toString();
      break;
    }
  }

  if (error) {
    return { status: "ERROR", error };
  }
  // upload assets <<

  // upload extensions >>
  const userDataPath = app.getPath("userData");

  const pArr = [];
  for (const extension of project.extensions) {
    const extensionFileName =
      extension.packageFiles.playerObjectFilename ||
      extension.packageFiles.playerAnimationFilename;

    const playerExtensionPath = path.join(
      userDataPath,
      "my-uploads",
      "my-extensions",
      extension.type,
      extensionFileName
    );

    pArr.push(
      bucketManager.uploadFileToBucket(
        bucketWithKeys,
        playerExtensionPath,
        `wsplayer/extensions/${extensionFileName}`
      )
    );
  }

  if (pArr.length > 0) {
    try {
      const result = await Promise.all(pArr);
      BrowserWindow.getAllWindows()[0].webContents.send(
        `ObjectStorageRenderer::SubscribeToPublishDetails`,
        JSON.stringify(result)
      );
    } catch (ex) {
      console.log(ex);
      error = ex.toString();
    }

    if (error) {
      return { status: "ERROR", error };
    }
  }
  // upload extensions <<

  // upload export/playerdata >>
  const exp = await loadExport(req.projectId);
  let expString = JSON.stringify(exp);
  for (let i = 0; i < uploadResult.length; i++) {
    expString = expString.replaceAll(
      `{MEDIA_ITEM_LIBRARY}`,
      `${publishDetails.baseUrl}assets/`
    );
    expString = expString.replaceAll(
      `{MEDIA_ITEM_LOCAL}`,
      `${publishDetails.baseUrl}assets/`
    );

    expString = expString.replaceAll(
      `"${uploadResult[i].fromUrl}"`,
      `"${uploadResult[i].toUrl}"`
    );
    expString = expString.replaceAll(
      `'${uploadResult[i].fromUrl}'`,
      `'${uploadResult[i].toUrl}'`
    );
  }

  // TODO: ADD ABSOLUTE URLS FOR OBJECTS

  const expBuffer = Buffer.from(expString, "utf-8");

  await bucketManager.uploadBufferToBucket(
    bucketWithKeys,
    expBuffer,
    `${req.projectId}/slider.json`
  );
  // upload export/playerdata <<

  // upload preview html >>
  const indexString = await fsPromise.readFile(
    path.join(getBucketPreviewPath(), "index.html"),
    "utf-8"
  );
  const indexBuffer = Buffer.from(indexString, "utf-8");

  await bucketManager.uploadBufferToBucket(
    bucketWithKeys,
    indexBuffer,
    `${req.projectId}/index.html`
  );
  // upload preview html <<

  // upload debug html >>
  if (bucket.environment === "development") {
    const debugString = await fsPromise.readFile(
      path.join(getBucketPreviewPath(), "debug.html"),
      "utf-8"
    );
    const debugBuffer = Buffer.from(debugString, "utf-8");

    await bucketManager.uploadBufferToBucket(
      bucketWithKeys,
      debugBuffer,
      `${req.projectId}/debug.html`
    );
  }
  // upload debug html <<

  assignedProject.revision = req.revision;

  await saveObjectStorage(objectStorageList);

  BrowserWindow.getAllWindows()[0].webContents.send(
    `ObjectStorageRenderer::SubscribeToPublishDetails`,
    JSON.stringify([{ log: "Publish has finished sucessfuly!" }])
  );

  return { status: "OK" };
});

ipcMain.handle("ObjectStorage::GetPublishDetails", async (event, reqJson) => {
  debug("Handle ObjectStorage::GetPublishDetails");

  const req = JSON.parse(reqJson);

  const bucketWithKeys = await getBucketWithKeys(req.bucketId);
  const ManagerClass = getBucketManagerClass(bucketWithKeys.platform);
  const bucketManager = new ManagerClass(bucketWithKeys);
  const publishDetails = await bucketManager.getPublishDetails(
    bucketWithKeys,
    req.projectId
  );

  return { ...publishDetails };
});

ipcMain.handle("ObjectStorage::Download", async (event, reqJson) => {
  debug("Handle ObjectStorage::Download");

  const req = JSON.parse(reqJson);

  const project = await loadProject(req.projectId);

  // download assets
  const assetsUrlsChunks = chunk(project.assetsUrls, PARALLEL_DOWNLOAD);

  BrowserWindow.getAllWindows()[0].webContents.send(
    `ObjectStorageRenderer::SubscribeToPublishDetails`,
    JSON.stringify([{ log: "Package download preparation has started" }])
  );
  var zip = new JSZip();

  // add assets >>
  const assetsResult = []; // from-to (for search/replace)
  let error;
  for (const assetsUrlsChunk of assetsUrlsChunks) {
    const pArr = [];
    for (const assetItem of assetsUrlsChunk) {
      if (assetItem.sourceType === "library") {
        pArr.push(downloadToBuffer(assetItem.url));
      }
      if (assetItem.sourceType === "local") {
        pArr.push(
          fileToBuffer(path.join(getMyImagesPath(), assetItem.localFilename))
        );
      }
    }

    try {
      const bufferArr = await Promise.all(pArr);

      bufferArr.forEach((buf, idx) => {
        const assetItem = assetsUrlsChunk[idx];
        let filename;

        if (assetItem.sourceType === "library") {
          var parsed = url.parse(assetItem.url);
          filename = path.basename(parsed.pathname);
          if (assetsUrlsChunk[idx].filename) {
            filename = assetsUrlsChunk[idx].filename;
          }

          assetsResult.push({
            fromUrl: assetItem.url,
            toUrl: `assets/${filename}`,
          });
        }

        if (assetItem.sourceType === "local") {
          filename = assetItem.filename;

          assetsResult.push({
            fromUrl: "file://" + assetItem.localFilename,
            toUrl: `assets/${filename}`,
          });
        }

        const assetZipFilePath = `${req.projectId}/assets/${filename}`;
        zip.file(assetZipFilePath, buf);

        BrowserWindow.getAllWindows()[0].webContents.send(
          `ObjectStorageRenderer::SubscribeToPublishDetails`,
          JSON.stringify([
            { log: `Add asset file to package: ${assetZipFilePath}` },
          ])
        );
      });
    } catch (ex) {
      console.log(ex);
      error = ex.toString();
      break;
    }
  }

  if (error) {
    return { status: "ERROR", error };
  }
  // add assets <<

  // add extensions >>
  const userDataPath = app.getPath("userData");

  const pArr = [];
  for (const extension of project.extensions) {
    const extensionFileName =
      extension.packageFiles.playerObjectFilename ||
      extension.packageFiles.playerAnimationFilename;

    const playerExtensionPath = path.join(
      userDataPath,
      "my-uploads",
      "my-extensions",
      extension.type,
      extensionFileName
    );

    pArr.push(fileToBuffer(playerExtensionPath));
  }

  try {
    const bufferArr = await Promise.all(pArr);

    bufferArr.forEach((buf, idx) => {
      const extension = project.extensions[idx];
      const filename =
        extension.packageFiles.playerObjectFilename ||
        extension.packageFiles.playerAnimationFilename;

      const extensionZipFilePath = `wsplayer/extensions/${filename}`;
      zip.file(extensionZipFilePath, buf);

      BrowserWindow.getAllWindows()[0].webContents.send(
        `ObjectStorageRenderer::SubscribeToPublishDetails`,
        JSON.stringify([
          { log: `Add extension file to package: ${extensionZipFilePath}` },
        ])
      );
    });
  } catch (ex) {
    console.log(ex);
    error = ex.toString();
  }
  // add extensions <<

  // add export/playerdata >>
  const exp = await loadExport(req.projectId);
  let expString = JSON.stringify(exp);
  for (let i = 0; i < assetsResult.length; i++) {
    expString = expString.replaceAll(`{MEDIA_ITEM_LIBRARY}`, `assets/`);
    expString = expString.replaceAll(`{MEDIA_ITEM_LOCAL}`, `assets/`);

    expString = expString.replaceAll(
      `"${assetsResult[i].fromUrl}"`,
      `"${assetsResult[i].toUrl}"`
    );
    expString = expString.replaceAll(
      `'${assetsResult[i].fromUrl}'`,
      `'${assetsResult[i].toUrl}'`
    );
  }
  const expBuffer = Buffer.from(expString, "utf-8");

  zip.file(`${req.projectId}/slider.json`, expBuffer);
  // add export/playerdata <<

  // add preview html >>
  const indexString = await fsPromise.readFile(
    path.join(getBucketPreviewPath(), "index.html"),
    "utf-8"
  );
  const indexBuffer = Buffer.from(indexString, "utf-8");
  zip.file(`${req.projectId}/index.html`, indexBuffer);
  // add preview html <<

  // add preview html with json >>
  // let previewString = await fsPromise.readFile(
  //   path.join(getBucketPreviewPath(), "preview-with-json.html"),
  //   "utf-8"
  // );
  // previewString = previewString.replace(
  //   "{$DATA}",
  //   expString
  //     .replace(/[\\]/g, "\\\\")
  //     .replace(/[\"]/g, '\\"')
  //     .replace(/[\/]/g, "\\/")
  //     .replace(/[\b]/g, "\\b")
  //     .replace(/[\f]/g, "\\f")
  //     .replace(/[\n]/g, "\\n")
  //     .replace(/[\r]/g, "\\r")
  //     .replace(/[\t]/g, "\\t")
  //   //expString.replace(/\\n/g, "").replaceAll(`\"`, `\\\"`)
  // );

  // const previewBuffer = Buffer.from(previewString, "utf-8");
  // zip.file(`${req.projectId}/preview-with-json.html`, previewBuffer);

  // BrowserWindow.getAllWindows()[0].webContents.send(
  //   `ObjectStorageRenderer::SubscribeToPublishDetails`,
  //   JSON.stringify([{ log: `Add index.html to package` }])
  // );
  // add preview html with json <<

  // add player >>
  const files = await getPlayerFiles();
  for (const file of files) {
    const fileCont = await fsPromise.readFile(
      path.join(getPlayerPath(), file),
      "utf-8"
    );
    //const indexBuffer = Buffer.from(fileCont, "utf-8");
    zip.file(`wsplayer/${app.getVersion()}/${file}`, fileCont);

    BrowserWindow.getAllWindows()[0].webContents.send(
      `ObjectStorageRenderer::SubscribeToPublishDetails`,
      JSON.stringify([{ log: `Add player files to package` }])
    );
  }

  if (error) {
    return { status: "ERROR", error };
  }
  // add player <<

  const base64Zip = zip.generateAsync({ type: "base64" });

  return base64Zip;
});

// HANDLERS END ============================================

async function loadObjectStorage() {
  const objectStoragePath = getObjectStoragePath();

  const exist = await checkFileExists(objectStoragePath);
  let os = [];
  if (exist) {
    const str = await fsPromise.readFile(objectStoragePath, "utf-8");
    os = JSON.parse(str);
  } else {
    await fsPromise.writeFile(objectStoragePath, "[]", "utf-8");
  }

  return os;
}

function getObjectStoragePath() {
  const userDataPath = app.getPath("userData");
  const objectStorageDir = path.join(userDataPath, "object-storage");
  if (!fs.existsSync(objectStorageDir)) {
    fs.mkdirSync(objectStorageDir);
  }
  return path.join(userDataPath, "object-storage", "object-storage.json");
}

async function saveObjectStorage(objectStorage) {
  await fsPromise.writeFile(
    getObjectStoragePath(),
    JSON.stringify(objectStorage, undefined, 2)
  );
}

async function getPlayerFiles() {
  const playerPath = getPlayerPath();

  const files = await fs.promises.readdir(playerPath);
  return files;
}
/*
async function uploadFileToS3(s3, bucketName, filePath, key) {
  const p = new Promise((resolve, reject) => {
    var fileStream = fs.createReadStream(filePath);
    var putParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: mime.lookup(key),
    };
    s3.putObject(putParams, function (putErr, putData) {
      if (putErr) {
        reject(putErr);
      } else {
        resolve();
      }
    });
  });

  await p;
}*/
/*
async function uploadBufferToS3(s3, bucketName, bufferStream, key) {
  const p = new Promise((resolve, reject) => {
    var putParams = {
      Bucket: bucketName,
      Key: key,
      Body: bufferStream,
      ContentType: mime.lookup(key),
    };
    s3.putObject(putParams, function (putErr, putData) {
      if (putErr) {
        reject(putErr);
      } else {
        resolve();
      }
    });
  });

  await p;
}
async function uploadUrlToBucket(bucketId, fromUrl, toKey) {
  const bucketWithKeys = await getBucketWithKeys(bucketId);

  const s3 = createS3Instance(bucketWithKeys);

  // download file
  const bufferStream = await downloadToBuffer(fromUrl);

  // upload file
  await uploadBufferToS3(s3, bucketWithKeys.bucketName, bufferStream, toKey);

  const toUrl = `https://${bucketWithKeys.bucketName}.s3.${bucketWithKeys.region}.amazonaws.com/${toKey}`;
  return {
    log: `From '${fromUrl}' to '${toUrl}'`,
    fromUrl,
    toUrl,
  };
}*/
/*
async function downloadToBuffer(url) {
  return fetch(url).then((res) => res.buffer());
}
*/
async function getBucketWithKeys(bucketId) {
  const objectStorageList = await loadObjectStorage();

  const item = objectStorageList.find((item) => item.id === bucketId);

  const secretKey = await keytar.getPassword(
    "wsSliderAppBucketKey",
    item.platform + "_" + item.bucketName
  );

  return { ...item, secretKey };
}

async function getBucketWithoutKeys(bucketId) {
  const objectStorageList = await loadObjectStorage();

  const item = objectStorageList.find((item) => item.id === bucketId);

  return item;
}

/*
function createS3Instance(bucketWithKeys) {
  switch (bucketWithKeys.platform) {
    case "s3": {
      return new AWS.S3({
        accessKeyId: bucketWithKeys.key,
        secretAccessKey: bucketWithKeys.secretKey,
      });
    }
    case "linode": {
      return new AWS.S3({
        accessKeyId: bucketWithKeys.key,
        secretAccessKey: bucketWithKeys.secretKey,
        endpoint: `http://eu-central-1.linodeobjects.com`,
      });
    }
  }
}
*/
//${bucketWithKeys.bucketName}.
