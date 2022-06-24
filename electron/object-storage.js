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
} = require("./utils");
const { loadProject, loadExport } = require("./project");
const { v4: uuid } = require("uuid");
const AWS = require("aws-sdk");
const { omit, without, chunk } = require("lodash");
const keytar = require("keytar");
const cloneDeep = require("clone-deep");
var JSZip = require("jszip");
const { downloadToBuffer } = require("./utils");

const {
  getBucketManagerClass,
} = require("./bucket-managers/bucket-manager-factory");

const PARALLEL_UPLOAD = 5; // for publish (download and upload)
const PARALLEL_DOWNLOAD = 5; // for download

ipcMain.handle("ObjectStorage::List", async (event, reqJson) => {
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
  const req = JSON.parse(reqJson);

  const objectStorageList = await loadObjectStorage();

  const deletedItem = remove(objectStorageList, (item) => item.id === req.id);

  await saveObjectStorage(objectStorageList);

  return { id: deletedItem.id };
});

ipcMain.handle("ObjectStorage::UploadPlayer", async (event, reqJson) => {
  const req = JSON.parse(reqJson);

  const objectStorageList = await loadObjectStorage();

  const bucket = objectStorageList.find((item) => item.id === req.id);

  const files = await getPlayerFiles();

  const secretKey = await keytar.getPassword(
    "wsSliderAppBucketKey",
    bucket.platform + "_" + bucket.bucketName
  );

  console.log(bucket.platform + "_" + bucket.bucketName);
  console.log("secretKey: " + secretKey);
  //const s3 = createS3Instance({ ...bucket, secretKey });

  const ManagerClass = getBucketManagerClass(bucket.platform);
  const bucketManager = new ManagerClass({
    ...bucket,
    secretKey,
  });

  console.log(files);
  let error = null;
  for (const file of files) {
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
  const req = JSON.parse(reqJson);

  console.log("node: ObjectStorage::Get");
  console.log(req);

  return {};
});

ipcMain.handle(
  "ObjectStorage::RemoveBucketFromProject",
  async (event, reqJson) => {
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
  const req = JSON.parse(reqJson);

  const objectStorageList = await loadObjectStorage();
  const bucket = objectStorageList.find((item) => item.id === req.bucketId);

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
    for (const assetUrl of assetsUrlsChunk) {
      var parsed = url.parse(assetUrl.url);
      let filename = path.basename(parsed.pathname);
      const extension = filename.substring(filename.indexOf("."));
      if (assetUrl.fileName) {
        filename = assetUrl.fileName + extension;
      }
      pArr.push(
        bucketManager.uploadUrlToBucket(
          bucketWithKeys,
          assetUrl.url,
          `${req.projectId}/assets/${filename}`
        )
        /*uploadUrlToBucket(
          req.bucketId,
          assetUrl.url,
          `${req.projectId}/assets/${filename}`
        )*/
      );
    }
    try {
      const result = await Promise.all(pArr);
      BrowserWindow.getAllWindows()[0].webContents.send(
        `ObjectStorageRenderer::SubscribeToPublishDetails`,
        JSON.stringify(result)
      );

      uploadResult = [...uploadResult, ...result];
      console.log("result");
      console.log(result);
    } catch (ex) {
      error = ex.toString();
      break;
    }
  }

  if (error) {
    return { status: "ERROR", error };
  }
  // upload assets <<

  // upload export/playerdata >>
  const exp = await loadExport(req.projectId);
  let expString = JSON.stringify(exp);
  for (let i = 0; i < uploadResult.length; i++) {
    expString = expString.replaceAll(
      `"${uploadResult[i].fromUrl}"`,
      `"${uploadResult[i].toUrl}"`
    );
    expString = expString.replaceAll(
      `'${uploadResult[i].fromUrl}'`,
      `'${uploadResult[i].toUrl}'`
    );
  }
  const expBuffer = Buffer.from(expString, "utf-8");
  await bucketManager.uploadBufferToBucket(
    bucketWithKeys,
    expBuffer,
    `${req.projectId}/slider.json`
  );
  /*
  const s3 = createS3Instance(bucketWithKeys);
  await uploadBufferToS3(
    s3,
    bucketWithKeys.bucketName,
    expBuffer,
    `${req.projectId}/slider.json`
  );*/
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
  /*await uploadBufferToS3(
    s3,
    bucketWithKeys.bucketName,
    indexBuffer,
    `${req.projectId}/index.html`
  );*/
  // upload preview htlm <<

  assignedProject.revision = req.revision;

  await saveObjectStorage(objectStorageList);

  BrowserWindow.getAllWindows()[0].webContents.send(
    `ObjectStorageRenderer::SubscribeToPublishDetails`,
    JSON.stringify([{ log: "Publish has finished sucessfuly!" }])
  );

  return { status: "OK" };
});

ipcMain.handle("ObjectStorage::GetPublishUrl", async (event, reqJson) => {
  const req = JSON.parse(reqJson);

  const bucketWithKeys = await getBucketWithKeys(req.bucketId);
  const ManagerClass = getBucketManagerClass(bucketWithKeys.platform);
  const bucketManager = new ManagerClass(bucketWithKeys);
  const publishUrl = await bucketManager.getPublishUrl(
    bucketWithKeys,
    req.projectId
  );

  return { publishUrl };
});

ipcMain.handle("ObjectStorage::Download", async (event, reqJson) => {
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
    const bArr = [];
    for (const assetUrl of assetsUrlsChunk) {
      console.log(assetUrl.url);
      bArr.push(downloadToBuffer(assetUrl.url));
    }
    try {
      const bufferArr = await Promise.all(bArr);
      /* BrowserWindow.getAllWindows()[0].webContents.send(
        `ObjectStorageRenderer::SubscribeToPublishDetails`,
        JSON.stringify(result)
      );*/

      console.log("process");
      bufferArr.forEach((buf, idx) => {
        var parsed = url.parse(assetsUrlsChunk[idx].url);
        let filename = path.basename(parsed.pathname);
        const extension = filename.substring(filename.indexOf("."));
        if (assetsUrlsChunk[idx].fileName) {
          filename = assetsUrlsChunk[idx].fileName + extension;
        }

        const zipFilePath = `${req.projectId}/assets/${filename}`;
        zip.file(zipFilePath, buf);

        assetsResult.push({
          fromUrl: assetsUrlsChunk[idx].url,
          toUrl: `assets/${filename}`,
        });

        BrowserWindow.getAllWindows()[0].webContents.send(
          `ObjectStorageRenderer::SubscribeToPublishDetails`,
          JSON.stringify([{ log: `Add asset file to package: ${zipFilePath}` }])
        );
      });

      //filesBuffers = [...filesBuffers, ...result];
      //console.log("filesBuffers.length: " + filesBuffers.length);
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

  // add export/playerdata >>
  const exp = await loadExport(req.projectId);
  let expString = JSON.stringify(exp);
  for (let i = 0; i < assetsResult.length; i++) {
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

  // upload preview html >>
  const indexString = await fsPromise.readFile(
    path.join(getBucketPreviewPath(), "index.html"),
    "utf-8"
  );
  const indexBuffer = Buffer.from(indexString, "utf-8");
  zip.file(`${req.projectId}/index.html`, indexBuffer);

  // preview with json
  let previewString = await fsPromise.readFile(
    path.join(getBucketPreviewPath(), "preview-with-json.html"),
    "utf-8"
  );
  previewString = previewString.replace(
    "{$DATA}",
    expString
      .replace(/[\\]/g, "\\\\")
      .replace(/[\"]/g, '\\"')
      .replace(/[\/]/g, "\\/")
      .replace(/[\b]/g, "\\b")
      .replace(/[\f]/g, "\\f")
      .replace(/[\n]/g, "\\n")
      .replace(/[\r]/g, "\\r")
      .replace(/[\t]/g, "\\t")
    //expString.replace(/\\n/g, "").replaceAll(`\"`, `\\\"`)
  );

  const previewBuffer = Buffer.from(previewString, "utf-8");
  zip.file(`${req.projectId}/preview-with-json.html`, previewBuffer);

  BrowserWindow.getAllWindows()[0].webContents.send(
    `ObjectStorageRenderer::SubscribeToPublishDetails`,
    JSON.stringify([{ log: `Add inted.html to package` }])
  );
  // upload preview html <<

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

  /*
  // upload assets <<

  // upload export/playerdata >>
  const exp = await loadExport(req.projectId);
  let expString = JSON.stringify(exp);
  for (let i = 0; i < uploadResult.length; i++) {
    expString = expString.replaceAll(
      `"${uploadResult[i].fromUrl}"`,
      `"${uploadResult[i].toUrl}"`
    );
    expString = expString.replaceAll(
      `'${uploadResult[i].fromUrl}'`,
      `'${uploadResult[i].toUrl}'`
    );
  }
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

  assignedProject.revision = req.revision;

  await saveObjectStorage(objectStorageList);

  BrowserWindow.getAllWindows()[0].webContents.send(
    `ObjectStorageRenderer::SubscribeToPublishDetails`,
    JSON.stringify([{ log: "Publish has finished sucessfuly!" }])
  );
*/
  // return { status: "OK" };
});
//============================================

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
  console.log(files);
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
