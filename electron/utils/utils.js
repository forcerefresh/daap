const fs = require("fs");
const { app } = require("electron");
const path = require("path");
const fetch = require("node-fetch");

function checkFileExists(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

function getPlayerPath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "player", "wsplayer", app.getVersion());
}

function getBucketPreviewPath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "player", "bucket-preview", app.getVersion());
}

async function downloadToBuffer(url) {
  return fetch(url).then((res) => res.buffer());
}

function appendToFileName(filename, appendStr) {
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return filename + appendStr;
  return filename.substr(0, idx) + appendStr + filename.substr(idx);
}

module.exports = {
  checkFileExists,
  getPlayerPath,
  getBucketPreviewPath,
  downloadToBuffer,
  appendToFileName,
};
