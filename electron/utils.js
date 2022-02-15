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
  return path.join(userDataPath, "player");
}

module.exports = {
  checkFileExists,
  getPlayerPath,
};
