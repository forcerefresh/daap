const { app, BrowserWindow, ipcMain } = require("electron");
var path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists } = require("./utils");

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

ipcMain.handle("AppSettings::SaveSettings", async (event, reqJson) => {
  const settings = JSON.parse(reqJson);
  await saveAppSettings(settings);
  return settings;
});

// ======

async function loadAppSettings() {
  const settingsPath = getAppSettingsPath();

  const exist = await checkFileExists(settingsPath);
  let os = {};
  if (exist) {
    const str = await fsPromise.readFile(settingsPath, "utf-8");
    os = JSON.parse(str);
  } else {
    await fsPromise.writeFile(settingsPath, "{}", "utf-8");
  }

  return os;
}

function getAppSettingsPath() {
  const userDataPath = app.getPath("userData");
  const settingsDir = path.join(userDataPath, "app-settings");
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir);
  }
  return path.join(userDataPath, "app-settings", "app-settings.json");
}

async function saveAppSettings(settings) {
  await fsPromise.writeFile(
    getAppSettingsPath(),
    JSON.stringify(settings, undefined, 2)
  );
}
