// logger config has to be at the top of file
require("./utils/logger-config");
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const windowStateKeeper = require("electron-window-state");
const { registerFileProtocol } = require("./utils/file-protocol");
const { copyPlayerFromAppToUserDataDelayed } = require("./utils/copy-player");
const { registerMainWindow } = require("./integration/system/system");
const { autoUpdater } = require("electron-updater");
// ----------

autoUpdater.allowPrerelease = true;
//autoUpdater.allowDowngrade = true;

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
});

// ----------

const {
  getAppSettingsConfiguration,
} = require("./integration/app-settings/app-settings");
// top-menu
require("./top-menu");

// integrations
require("./integration/project/project");
require("./integration/template/template");
require("./integration/template/remote-template");
require("./integration/object-storage/object-storage");
require("./integration/app-settings/app-settings");
require("./integration/my-uploads/my-uploads");
require("./integration/extensions/extensions");
require("./integration/development/development");
require("./integration/license/license");
require("./integration/presets/presets");

// custom file protocol
registerFileProtocol();

// copy player to userData dir
copyPlayerFromAppToUserDataDelayed();

// create media dirs
createMediaDirs();

// electron reloader
if (process.env.ELECTRON_ENV === "development") {
  try {
    require("electron-reloader")(module);
  } catch (err) {
    console.error("Error: electron-loader exception");
    console.error(err);
  }
}

function sendStatusToWindow(text) {
  mainWindow.webContents.send("System::Logger", text);
}

// other main functionality

let mainWindow;
async function createWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 576,
    maximize: false,
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.setBackgroundColor("#333");

  mainWindowState.manage(mainWindow);

  mainWindow.once("ready-to-show", () => {
    //mainWindow.webContents.setZoomFactor(0.8);
    mainWindow.show();
    registerMainWindow(mainWindow);

    autoUpdater.checkForUpdatesAndNotify();
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  // and load the index.html of the app.

  const enableDeveloper = await getAppSettingsConfiguration("enableDeveloper");
  const devTools = await getAppSettingsConfiguration("devTools");
  if (enableDeveloper && devTools) {
    mainWindow.webContents.openDevTools();
  }

  if (process.env.ELECTRON_ENV === "development") {
    //mainWindow.webContents.openDevTools();
    mainWindow.loadURL("http://localhost:3000/");
  } else {
    mainWindow.removeMenu();
    mainWindow.loadFile("./build/index.html");
  }
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  return mainWindow;
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  //app.quit();
} else {
  app.on(
    "second-instance",
    (event, commandLine, workingDirectory, additionalData) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    }
  );

  // Create myWindow, load the rest of the app, etc...
  app.whenReady().then(async () => {
    app.on("activate", async function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = await createWindow();
      }
    });

    mainWindow = await createWindow();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

function createMediaDirs() {
  const userDataPath = app.getPath("userData");
  const myUploadsPath = path.join(userDataPath, "my-uploads");
  if (!fs.existsSync(myUploadsPath)) {
    fs.mkdirSync(myUploadsPath);
  }

  [
    "my-vectors",
    "my-images",
    "my-videos",
    "my-templates",
    "my-remote-templates",
    "my-audios",
    "my-extensions",
  ].forEach((type) => {
    const mPath = path.join(myUploadsPath, type);
    if (!fs.existsSync(mPath)) {
      fs.mkdirSync(mPath);
    }
  });
}
