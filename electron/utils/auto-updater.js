const { autoUpdater } = require("electron-updater");
const { BrowserWindow } = require("electron");

const {
  getAppSettingsConfiguration,
} = require("../integration/app-settings/app-settings");

function checkForUpdatesAndNotify() {
  autoUpdater.checkForUpdatesAndNotify();
}

async function initializeAutoUpdater() {
  const allowPrerelease = await getAppSettingsConfiguration("allowPrerelease");

  autoUpdater.allowPrerelease = !!allowPrerelease;
  //autoUpdater.allowDowngrade = !!allowDowngrade;

  autoUpdater.on("checking-for-update", () => {
    sendStatusToWindow("Checking for update...");
  });
  autoUpdater.on("update-available", (info) => {
    sendStatusToWindow("Update available.");
  });
  autoUpdater.on("update-not-available", (info) => {
    sendStatusToWindow("Update not available.");
  });
  autoUpdater.on("error", (err) => {
    sendStatusToWindow("Error in auto-updater. " + err);
  });
  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + " - Downloaded " + progressObj.percent + "%";
    log_message =
      log_message +
      " (" +
      progressObj.transferred +
      "/" +
      progressObj.total +
      ")";
    sendStatusToWindow(log_message);
  });
  autoUpdater.on("update-downloaded", (info) => {
    sendStatusToWindow("Update downloaded");
    sendStatusToWindow(info);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    mainWindow.webContents.send("System::NewVersionAvailable", info);
  });
}

function sendStatusToWindow(text) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.webContents.send("System::Logger", text);
}

module.exports = {
  checkForUpdatesAndNotify,
  initializeAutoUpdater,
};
