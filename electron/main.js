const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { forEach, remove } = require("lodash");

try {
  require("electron-reloader")(module);
} catch {}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.webContents.openDevTools();
  // and load the index.html of the app.
  //mainWindow.loadFile("electron/index.html");
  mainWindow.loadURL("http://localhost:3000/");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

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
  const { name, description, slides, project, preview } = data;

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
    });
  } else {
    projects[projectItemIndex] = {
      id,
      name,
      description,
      slides,
      created,
      modified,
      project,
      preview,
    };
  }

  await saveProjects(projects);

  return {
    id: id,
    name,
    description: description,
    slides: slides,
    created: created.toString(),
    modified: modified.toString(),
  };
});

ipcMain.handle("apiGetProjects", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { from, search, perPage } = data;

  const projects = await loadProjects();

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

  const projects = await loadProjects();

  const project = projects.find((p) => p.id === id);

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

function checkFileExists(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

async function loadProjects() {
  const projectPath = getProjectPath();

  const exist = await checkFileExists(projectPath);
  let projects = [];
  if (exist) {
    const projectsStr = await fsPromise.readFile(projectPath, "utf-8");
    projects = JSON.parse(projectsStr);
  }

  return projects;
}

async function saveProjects(projects) {
  await fsPromise.writeFile(
    getProjectPath(),
    JSON.stringify(projects, undefined, 2)
  );
}

function getProjectPath() {
  const userDataPath = app.getPath("userData");
  const projectsDir = path.join(userDataPath, "projects");
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir);
  }
  return path.join(userDataPath, "projects", "projects.json");
}
