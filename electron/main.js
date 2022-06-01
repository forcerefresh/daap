const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { forEach, remove } = require("lodash");
const windowStateKeeper = require("electron-window-state");

console.log(app.getVersion());

// menu
if (process.platform === "darwin") {
  const template = [
    {
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [{ role: "togglefullscreen" }],
    },
    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
} else {
  Menu.setApplicationMenu(null);
}

const { checkFileExists } = require("./utils.js");
const {
  loadProject,
  loadProjects,
  saveProjects,
  loadExports,
  saveExports,
} = require("./project.js");

require("./object-storage.js");

try {
  require("electron-reloader")(module);
} catch {}

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
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
/*
ipcMain.handle("apiSaveProject", async (event, data) => {
  return new Promise((resolve, reject) => {
    const userDataPath = app.getPath("userData");

    fs.writeFile(
      userDataPath + "/projects.json",
      JSON.stringify(data, undefined, 2),
      () => {
        resolve(
          JSON.stringify({
            id: 1,
            name: "12",
            description: "string",
            slides: 1,
            created: "string",
            modified: "string",
          }),
          undefined,
          2
        );
      }
    );
  });
});*/

ipcMain.handle("apiSaveProject", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const {
    name,
    description,
    slides,
    project,
    preview,
    playerData,
    assetsUrls,
  } = data;

  let { id, created } = data;

  const projects = await loadProjects();

  let projectItem;
  let projectItemIndex = -1;
  if (!id) {
    id = 0;
    forEach(projects, (project) => {
      id = Math.max(parseInt(project.id), id);
    });
    id++;
  } else {
    projectItem = projects.find((p) => p.id === id);
    projectItemIndex = projects.indexOf(projectItem);
  }

  const modified = new Date().getTime();
  created = projectItem ? projectItem.created : modified;

  let saveRevision = 1;
  //let publishRevision = 0;
  if (projectItemIndex === -1) {
    projects.push({
      id,
      name,
      description,
      slides,
      created,
      modified,
      project,
      preview,
      saveRevision,
      //publishRevision,
      assetsUrls,
    });
  } else {
    saveRevision = projectItem.saveRevision + 1;
    //publishRevision = projectItem.publishRevision;

    projects[projectItemIndex] = {
      id,
      name,
      description,
      slides,
      created,
      modified,
      project,
      preview,
      saveRevision,
      //publishRevision,
      assetsUrls,
    };
  }

  await saveProjects(projects);

  // player data
  const exps = await loadExports();
  playerData.name = name;
  exps[id] = playerData;
  await saveExports(exps);

  return {
    id: id,
    name,
    description: description,
    slides: slides,
    created: created.toString(),
    modified: modified.toString(),
    saveRevision,
    assetsUrls,

    //publishRevision,
  };
});

ipcMain.handle("apiGetProjects", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { from, search, perPage } = data;

  const projects = await loadProjects();

  projects.reverse();

  const retArr = projects.splice(from, from + perPage);

  return { projects: retArr };
});

ipcMain.handle("apiDeleteProject", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { id } = data;

  const projects = await loadProjects();

  remove(projects, (project) => {
    return project.id === id;
  });

  await saveProjects(projects);

  return { id };
});

ipcMain.handle("apiGetProject", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { id } = data;

  const project = await loadProject(id);

  return { project };
});

ipcMain.handle("apiGetNextProjectId", async (event) => {
  const projects = await loadProjects();

  let maxId = 1;

  projects.forEach((p) => {
    maxId = Math.max(maxId, p.id);
  });

  return maxId + 1;
});

// MY IMAGES ---------

function convertToBlob(base64image) {
  // convert base64 to raw binary data held in a string
  var byteString = atob(base64image.split(",")[1]);
  // separate out the mime component
  var mimeString = base64image.split(",")[0].split(":")[1].split(";")[0];
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var dw = new DataView(ab);
  for (var i = 0; i < byteString.length; i++) {
    dw.setUint8(i, byteString.charCodeAt(i));
    alert("arrived here");

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], {
      type: mimeString,
    });
  }
}

ipcMain.handle("myImagesUpload", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { fileBase64, fileMetadata } = data;

  let myImages = await loadMyImages();

  //const data2 = await fetch(fileBase64).then((res) => res.blob());

  const userDataPath = app.getPath("userData");
  const myImagePath = path.join(userDataPath, "my-images", "image.jpg");

  let base64Image = fileBase64.split(";base64,").pop();

  await fsPromise.writeFile(myImagePath, base64Image, { encoding: "base64" });

  /// const data2 = convertToBlob(fileBase64);
  //console.log(fileBase64);
  return { status: "OK" };
});

ipcMain.handle("myImagesFetchImages", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { from, tag, search, perPage } = data;

  let myImages = await loadMyImages();

  if (tag) {
    myImages = myImages.filter(
      (image) => image.tags && image.tags.indexOf(tag) !== -1
    );
  }

  if (search) {
    myImages = myImages.filter((image) => image.title.indexOf(search) !== -1);
  }

  myImages = myImages.splice(from, from + perPage);

  return { photos: myImages };
});

async function loadMyImages() {
  const myImagesPath = getMyImagePath();

  const exist = await checkFileExists(myImagesPath);
  let myImages = [];
  if (exist) {
    const myImagesStr = await fsPromise.readFile(myImagesPath, "utf-8");
    myImages = JSON.parse(myImagesStr);
  }

  return myImages;
}

async function saveMyImages(projects) {
  await fsPromise.writeFile(
    getMyImagePath(),
    JSON.stringify(projects, undefined, 2)
  );
}

function getMyImagePath() {
  const userDataPath = app.getPath("userData");
  const myImagesDir = path.join(userDataPath, "my-images");
  if (!fs.existsSync(myImagesDir)) {
    fs.mkdirSync(myImagesDir);
  }
  return path.join(userDataPath, "my-images", "my-images.json");
}

/*
const { from, tag, search, perPage = 10 } = props;

let myImages: ImageData[] = JSON.parse(
  localStorage.getItem(`my-images`) || "[]"
);

console.log(tag);
if (tag) {
  myImages = myImages.filter(
    (image) => image.tags && image.tags.indexOf(tag) !== -1
  );
}

if (search) {
  myImages = myImages.filter((image) => image.title.indexOf(search) !== -1);
}

console.log(myImages.length);
console.log(props);
const retArr = myImages.splice(from, from + perPage);

return { photos: retArr } as any; //ImageSetData[];*/

// UTILS -------

module.export = {
  loadProject,
};
