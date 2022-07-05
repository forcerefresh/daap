const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists } = require("../../utils/utils.js");

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

function getExportsPath() {
  const userDataPath = app.getPath("userData");
  const projectsDir = path.join(userDataPath, "projects");
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir);
  }
  return path.join(userDataPath, "projects", "exports.json");
}

async function loadExport(id) {
  const exports = await loadExports();

  return exports[id];
}

async function loadExports() {
  const exportsPath = getExportsPath();

  const exist = await checkFileExists(exportsPath);
  let exports = {};
  if (exist) {
    const exportsStr = await fsPromise.readFile(exportsPath, "utf-8");
    exports = JSON.parse(exportsStr);
  }

  return exports;
}

async function saveExports(exports) {
  await fsPromise.writeFile(
    getExportsPath(),
    JSON.stringify(exports, undefined, 2)
  );
}

module.exports = {
  loadProject,
  loadProjects,
  saveProjects,
  loadExport,
  loadExports,
  saveExports,
};
