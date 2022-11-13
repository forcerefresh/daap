const { app, protocol } = require("electron");
const path = require("path");
const { debug, info } = require("./logger");

function fileHandler(req, callback) {
  debug(req);
  debug(req.url);

  let requestedPath = req.url;
  requestedPath = requestedPath.replace("webslider-fp://", "/");
  // IMPORTANT: prevent access to parent folder structure
  requestedPath = path.normalize(requestedPath);

  // Write some code to resolve path, calculate absolute path etc
  let check = true; // Write some code here to check if you should return the file to renderer process

  if (!check) {
    callback({
      // -6 is FILE_NOT_FOUND
      // https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h
      error: -6,
    });
    return;
  }
  const userDataPath = app.getPath("userData");

  const filePath = path.join(userDataPath, requestedPath);

  callback({
    path: filePath,
  });
}

function registerFileProtocol() {
  app.whenReady().then(() => {
    protocol.registerFileProtocol("webslider-fp", fileHandler);
    info("Register 'webslider-fp' file protocol.");
  });
}

module.exports = { registerFileProtocol };
