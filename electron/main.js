const { app, BrowserWindow } = require("electron");
const windowStateKeeper = require("electron-window-state");

// top-menu
require("./top-menu");

// integrations
require("./integration/project/project");
require("./integration/object-storage/object-storage");
require("./integration/api-settings/app-settings");
require("./integration/my-media/my-media");

// electron reloader
if (process.env.ELECTRON_ENV === "development") {
  try {
    require("electron-reloader")(module);
  } catch (err) {
    console.error("Error: electron-loader exception");
    console.error(err);
  }
}

// other main functionality

let mainWindow;
function createWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 600,
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
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  // and load the index.html of the app.

  if (process.env.ELECTRON_ENV === "development") {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL("http://localhost:3000/");
  } else {
    mainWindow.removeMenu();
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile("./build/index.html");
  }
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  return mainWindow;
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
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
  app.whenReady().then(() => {
    mainWindow = createWindow();

    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
      }
    });
    /*
    mainWindow.webContents.on("did-finish-load", function () {
      var jsFile = fs.readFileSync(
        path.join(getMarketplacePath(), "sample-object.js")
      );
      mainWindow.webContents.executeJavaScript(jsFile);
      mainWindow.webContents.executeJavaScript(
        `window.WebSlider_GlobalScope.registerExternalObject(window.WebSlider_GlobalScope.objects["sample_object"])`
      );
    });*/
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
