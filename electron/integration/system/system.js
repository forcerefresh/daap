const { ipcMain, BrowserWindow } = require("electron");

let mainWindow;
let showExitPrompt = true;

let docWindow;

function registerMainWindow(win) {
  showExitPrompt = true;
  mainWindow = win;

  mainWindow.on("close", (e) => {
    if (showExitPrompt) {
      e.preventDefault(); // Prevents the window from closing
      mainWindow.webContents.send("System::RequestForClose");
    }
  });
}

ipcMain.handle("System::Quit", async (event, dataStr) => {
  showExitPrompt = false;
  mainWindow.close();
});

ipcMain.handle("System::CancelQuit", async (event, dataStr) => {
  showExitPrompt = true;
});

ipcMain.handle("System::OpenDocs", async (event, dataStr) => {
  if (docWindow) {
    docWindow.hide();
    docWindow.show();
    return;
  }
  docWindow = new BrowserWindow({
    title: "Web Slider Documentation",
    x: 0,
    y: 0,
    width: 1200,
    height: 750,
    // webPreferences: {
    //   nodeIntegration: true,
    //   contextIsolation: false,
    // },
  });
  docWindow.loadURL("https://webslider.io/appdocs/introduction/");
  docWindow.on("close", () => {
    docWindow = null;
  });
});

module.exports = {
  registerMainWindow,
};
