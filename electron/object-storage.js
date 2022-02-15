const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { forEach, remove } = require("lodash");
const { checkFileExists, getPlayerPath } = require("./utils");
const { v4: uuid } = require("uuid");
const AWS = require("aws-sdk");
const { omit, without } = require("lodash");
const keytar = require("keytar");
const cloneDeep = require("clone-deep");

ipcMain.handle("ObjectStorage::List", async (event, reqJson) => {
  console.log("node: ObjectStorage::List");
  const req = JSON.parse(reqJson);

  let objectStorageList = await loadObjectStorage();

  if (req.projectId) {
    console.log(req);
    objectStorageList = objectStorageList.map((bucket) => {
      const ret = cloneDeep(bucket);
      console.log(bucket.assignedProjects);
      console.log(req.projectId);

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
  console.log("node: ObjectStorage::ListAssigned");
  const req = JSON.parse(reqJson);
  console.log(req);

  let objectStorageList = await loadObjectStorage();

  if (req.projectId) {
    console.log(req);
    objectStorageList = objectStorageList.map((bucket) => {
      const ret = cloneDeep(bucket);
      console.log(bucket.assignedProjects);
      console.log(req.projectId);

      ret.assignedProject = (bucket.assignedProjects || []).find(
        (item) => item.projectId === req.projectId
      );

      if (!ret.assignedProject) return undefined;

      delete ret.assignedProjects;
      return ret;
    });

    objectStorageList = without(objectStorageList, undefined);
  }

  console.log(objectStorageList);
  return objectStorageList.map((item) => omit(item, "secretKey"));
});

ipcMain.handle("ObjectStorage::Add", async (event, reqJson) => {
  console.log("node: ObjectStorage::Add");
  console.log(reqJson);

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
    console.log("TODO");
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

  const item = objectStorageList.find((item) => item.id === req.id);

  const files = await getPlayerFiles();

  const secretKey = await keytar.getPassword(
    "wsSliderAppBucketKey",
    item.platform + "_" + item.bucketName
  );

  const s3 = new AWS.S3({
    accessKeyId: item.key,
    secretAccessKey: secretKey,
  });

  let error = null;
  for (const file of files) {
    try {
      await uploadToS3(
        s3,
        item.bucketName,
        path.join(getPlayerPath(), file),
        "wsplayer/" + file
      );
    } catch (ex) {
      error = ex.toString();
      break;
    }
  }

  if (error) {
    return { status: "ERROR", error };
  }

  item.playerStatus = "uploaded";

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

  // todo: upload
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });

  assignedProject.revision = req.revision;

  await saveObjectStorage(objectStorageList);

  return { status: "OK" };
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

async function uploadToS3(s3, bucketName, filePath, key) {
  const p = new Promise((resolve, reject) => {
    var fileStream = fs.createReadStream(filePath);
    var putParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
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
