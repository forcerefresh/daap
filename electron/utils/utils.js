const fs = require("fs");
const fsPromise = require("fs/promises");
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fetch = require("node-fetch");

function checkDirExists(dir) {
  return fs.promises
    .access(dir)
    .then(() => true)
    .catch(() => false);
}

function checkFileExists(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

function getPlayerPath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "player", "wsplayer");
}

function getMyImagesPath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "my-uploads", "my-images");
}

function getMyVideosPath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "my-uploads", "my-videos");
}

function getMyAudiosPath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "my-uploads", "my-audios");
}

function getBucketPreviewPath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "player", "bucket-preview");
}

async function downloadToBuffer(url) {
  return fetch(url).then((res) => res.buffer());
}

async function fileToBuffer(filePath) {
  return fsPromise.readFile(filePath);
}

function appendToFileName(filename, appendStr) {
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return filename + appendStr;
  return filename.substr(0, idx) + appendStr + filename.substr(idx);
}

async function isExists(path) {
  try {
    await fsPromise.access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeFileWithPath(filePath, data, encoding) {
  try {
    const dirname = path.dirname(filePath);
    const exist = await isExists(dirname);
    if (!exist) {
      await fsPromise.mkdir(dirname, { recursive: true });
    }

    await fsPromise.writeFile(filePath, data, encoding);
  } catch (err) {
    throw new Error(err);
  }
}

function openOrCloseDevTool(open) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (open) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.closeDevTools();
  }
}

module.exports = {
  checkFileExists,
  checkDirExists,
  getPlayerPath,
  getBucketPreviewPath,
  downloadToBuffer,
  appendToFileName,
  getMyImagesPath,
  getMyVideosPath,
  getMyAudiosPath,
  fileToBuffer,
  writeFileWithPath,
  openOrCloseDevTool,
};
