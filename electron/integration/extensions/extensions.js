const { app, BrowserWindow, ipcMain } = require("electron");
var path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists, downloadToBuffer } = require("../../utils/utils");
const JSZip = require("jszip");
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
  //console.log(fullPackageUrl);
  const zipPackage = await downloadToBuffer(fullPackageUrl);
  //console.log(zipPackage);
  let zip = new JSZip();
  zip = await zip.loadAsync(zipPackage);

  //console.log(Object.keys(zip.files));
  const extensionDir = getExtensionPath(extension.type);
  const fileNames = Object.keys(zip.files);
  for (let i = 0; i < fileNames.length; i++) {
    const content = await zip.files[fileNames[i]].async("nodebuffer");
    var dest = path.join(extensionDir, fileNames[i]);
    //console.log(dest);
    await fsPromise.writeFile(dest, content);
  }

  // 2. add to DB
  const extensions = await loadExtensions();
  extensions.push(extension);
  await saveExtensions(extensions);

  return extension;
});

ipcMain.handle("Extensions::UninstallExtension", async (event, reqJson) => {
  const { id } = JSON.parse(reqJson);

  // remove from DB
  const extensions = await loadExtensions();

  const extensionToDelete = extensions.find((item) => {
    return item.id === id;
  });

  // NOTE: this should not happen, its there for preventing strange behavior
  if (!extensionToDelete) return;

  const newExtensions = extensions.filter((item) => {
    return item.id !== id;
  });

  await saveExtensions(newExtensions);

  // 12. delete package folder
  const extensionDir = getExtensionPath(extensionToDelete.type);
  fsPromise.rm(extensionDir, { recursive: true, force: true });

  return extensionToDelete;
});

ipcMain.handle("Extensions::LoadExtension", async (event, reqJson) => {
  //console.log(reqJson);
  const { type } = JSON.parse(reqJson);

  const extensions = await loadExtensions();
  const extension = extensions.find((item) => item.type === type);

  if (!extension) {
    console.log(`Extension '${type}' does not exists.`);
    return;
  }

  const extensionDir = getExtensionPath(extension.type);
  const extFilePath = path.join(extensionDir, extension.packageFiles.objectApp);

  const fileContent = await fsPromise.readFile(extFilePath);
  //console.log(fileContent);
  const mainWindow = BrowserWindow.getAllWindows()[0];
  //console.log(mainWindow);
  await mainWindow.webContents.executeJavaScript(fileContent);
  //mainWindow.webContents.executeJavaScript(
  //  `window.WebSlider_GlobalScope.registerExternalObject(window.WebSlider_GlobalScope.objects["sample_object"])`
  //);

  return;
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
  if (!fs.existsSync(extensionDir)) {
    fs.mkdirSync(extensionDir);
  }
  return extensionDir;
}

async function saveExtensions(extensions) {
  await fsPromise.writeFile(
    getExtensionsPath(),
    JSON.stringify(extensions, undefined, 2)
  );
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
