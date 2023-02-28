const { ipcMain } = require("electron");

let mainWindow;
let showExitPrompt = true;

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

module.exports = {
  registerMainWindow,
};
