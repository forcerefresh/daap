const fs = require("fs");
const { app } = require("electron");
const path = require("path");

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
module.exports = {
  checkFileExists,
  getPlayerPath,
  getBucketPreviewPath,
};
