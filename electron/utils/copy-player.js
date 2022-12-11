const path = require("path");
const fs = require("fs-extra");
const { BrowserWindow, app } = require("electron");

// let mainWindow;

// const log = (string) => {
//   console.log(string);
//   mainWindow.webContents.executeJavaScript(`console.log('${string}')`);
// };

function copyPlayerFromAppToUserDataDelayed() {
  setTimeout(() => {
    //mainWindow = BrowserWindow.getAllWindows()[0];
    //mainWindow.webContents.openDevTools();
    copyPlayerFromAppToUserData();
  }, 1);
}

async function copyPlayerFromAppToUserData() {
  //log(process.resourcesPath);
  //log(getAppDataPath());
  //log(path.resolve(__dirname));

  const playerPathSource = path.resolve(
    process.resourcesPath,
    "../player-dist/player"
  );
  const playerPathTarget = path.join(app.getPath("userData"), "player");

  //log(playerPathSource);
  //log(playerPathTarget);

  if (!fs.existsSync(playerPathTarget)) {
    fs.mkdirSync(playerPathTarget);
  }

  await fs.copy(playerPathSource, playerPathTarget);

  //log("DONE");
}

function getAppDataPath() {
  switch (process.platform) {
    case "darwin": {
      return path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "web-slider"
      );
    }
    case "win32": {
      return path.join(process.env.APPDATA, "web-slider");
    }
    case "linux": {
      return path.join(process.env.HOME, ".web-slider");
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
}

module.exports = {
  copyPlayerFromAppToUserData,
  copyPlayerFromAppToUserDataDelayed,
};
