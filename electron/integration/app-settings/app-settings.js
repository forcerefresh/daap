const { app, BrowserWindow, ipcMain } = require("electron");
var path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists, openOrCloseDevTool } = require("../../utils/utils");

ipcMain.handle("AppSettings::ScaleUI", async (event, reqJson) => {
  const req = JSON.parse(reqJson);
  if (req.zoom) {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.setZoomFactor(req.zoom);
    });
  }
});

ipcMain.handle("AppSettings::GetSettings", async (event, reqJson) => {
  const settings = await loadAppSettings();
  settings.appVersion = app.getVersion();
  console.log(app.getVersion());
  return settings;
});

ipcMain.handle("AppSettings::SaveSettings", async (event, reqJson) => {
  const existingSettings = loadAppSettings();
  const settings = JSON.parse(reqJson);
  if (
    existingSettings.enableDeveloper !== settings.enableDeveloper ||
    existingSettings.devTools !== settings.devTools
  ) {
    openOrCloseDevTool(settings.enableDeveloper && settings.devTools);
  }
  await saveAppSettings(settings);
  return settings;
});

// ======
async function getAppSettingsConfiguration(propertyName) {
  const appSettings = await loadAppSettings();
  return appSettings[propertyName];
}

async function loadAppSettings() {
  const settingsPath = getAppSettingsPath();

  const exist = await checkFileExists(settingsPath);
  let appSettings = {};
  if (exist) {
    const str = await fsPromise.readFile(settingsPath, "utf-8");
    appSettings = JSON.parse(str);
  } else {
    await fsPromise.writeFile(settingsPath, "{}", "utf-8");
  }

  return appSettings;
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

module.exports = {
  getAppSettingsConfiguration,
};
