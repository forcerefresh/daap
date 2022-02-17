const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { forEach, remove } = require("lodash");
const { checkFileExists } = require("./utils.js");

async function loadProject(id) {
  const projects = await loadProjects();

  const project = projects.find((p) => p.id === id);

  return project;
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

module.exports = {
  loadProject,
  loadProjects,
  saveProjects,
};
