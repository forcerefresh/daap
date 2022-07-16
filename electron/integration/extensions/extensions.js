const { app, BrowserWindow, ipcMain } = require("electron");
var path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists, downloadToBuffer } = require("../../utils/utils");

/*
ipcMain.handle("AppSettings::ScaleUI", async (event, reqJson) => {
  const req = JSON.parse(reqJson);
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.setZoomFactor(req.zoom);
  });
});

ipcMain.handle("AppSettings::GetSettings", async (event, reqJson) => {
  const settings = await loadAppSettings();
  return settings;
});
*/

ipcMain.handle("Extensions::GetInstalledExtensions", async (event) => {
  const extensions = await loadExtensions();

  return { items: extensions };
});

ipcMain.handle("Extensions::InstallExtension", async (event, reqJson) => {
  const extension = JSON.parse(reqJson);

  // 1. add script

  const fullPackageUrl = `${extension.packageUrl}`;
  console.log(fullPackageUrl);
  const zipPackage = await downloadToBuffer(fullPackageUrl);
  const zip = new JSZip();
  await zip.loadAsync(zipPackage);

  const extensionDir = getExtensionPath(extension.type);
  Object.keys(zip.files).forEach(function (filename) {
    zip.files[filename].async("nodebuffer").then(function (content) {
      var dest = extensionDir + filename;
      console.log(dest);
      fs.writeFileSync(dest, content);
    });
  });

  // 2. add to DB
  const extensions = await loadExtensions();
  extensions.push(extension);
  await saveExtensions(extensions);

  return extension;
});

// ======

async function loadExtensions() {
  const extensionsPath = getExtensionsPath();

  const exist = await checkFileExists(extensionsPath);
  let extensionsData = [];
  if (exist) {
    const str = await fsPromise.readFile(extensionsPath, "utf-8");
    extensionsData = JSON.parse(str);
  } else {
    await fsPromise.writeFile(extensionsPath, "[]", "utf-8");
  }

  return extensionsData;
}

function getExtensionsPath() {
  const userDataPath = app.getPath("userData");
  const extensionsDir = path.join(userDataPath, "extensions");
  if (!fs.existsSync(extensionsDir)) {
    fs.mkdirSync(extensionsDir);
  }
  return path.join(userDataPath, "extensions", "extensions.json");
}

function getExtensionPath(type) {
  const userDataPath = app.getPath("userData");
  const extensionsDir = path.join(userDataPath, "extensions");
  if (!fs.existsSync(extensionsDir)) {
    fs.mkdirSync(extensionsDir);
  }
  const extensionDir = path.join(userDataPath, "extensions", type);
  if (!fs.existsSync(extensionsDir)) {
    fs.mkdirSync(extensionsDir);
  }
  return extensionDir;
}

async function saveExtensions(extensions) {
  await fsPromise.writeFile(
    getExtensionsPath(),
    JSON.stringify(extensions, undefined, 2)
  );
}
