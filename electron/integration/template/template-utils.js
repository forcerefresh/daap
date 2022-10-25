const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists, checkDirExists } = require("../../utils/utils.js");

async function loadTemplate(id) {
  const userDataPath = app.getPath("userData");
  const myTemplateZipPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    id,
    "project.json"
  );
  const projectStr = await fsPromise.readFile(myTemplateZipPath, "utf-8");

  const template = JSON.parse(projectStr);

  return template;
}

async function loadTemplates() {
  const templatePath = getTemplatePath();

  const exist = await checkFileExists(templatePath);
  let templates = [];
  if (exist) {
    const templatesStr = await fsPromise.readFile(templatePath, "utf-8");
    templates = JSON.parse(templatesStr);
  }

  return templates;
}

async function saveTemplates(templates) {
  await fsPromise.writeFile(
    getTemplatePath(),
    JSON.stringify(templates, undefined, 2)
  );
}

function getTemplatePath() {
  const userDataPath = app.getPath("userData");

  const templatesDirPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates"
  );

  if (!fs.existsSync(templatesDirPath)) {
    fs.mkdirSync(templatesDirPath);
  }

  return path.join(templatesDirPath, "templates.json");
}

// function getTemplateExportsPath() {
//   const userDataPath = app.getPath("userData");
//   const templatesDir = path.join(userDataPath, "templates");
//   if (!fs.existsSync(templatesDir)) {
//     fs.mkdirSync(templatesDir);
//   }
//   return path.join(userDataPath, "templates", "exports.json");
// }

// async function loadTemplateExport(id) {
//   const exports = await loadTemplateExports();

//   return exports[id];
// }

// async function loadTemplateExports() {
//   const exportsPath = getTemplateExportsPath();

//   const exist = await checkFileExists(exportsPath);
//   let exports = {};
//   if (exist) {
//     const exportsStr = await fsPromise.readFile(exportsPath, "utf-8");
//     exports = JSON.parse(exportsStr);
//   }

//   return exports;
// }

// async function saveTemplateExports(exports) {
//   await fsPromise.writeFile(
//     getTemplateExportsPath(),
//     JSON.stringify(exports, undefined, 2)
//   );
// }

async function saveTemplateProject(name, project) {
  await fsPromise.writeFile(
    path.join(getMyTemplatePath(name), "project.json"),
    JSON.stringify(project, undefined, 2)
  );
}

async function saveTemplateExport(name, exportData) {
  await fsPromise.writeFile(
    path.join(getMyTemplatePath(name), "export.json"),
    JSON.stringify(exportData, undefined, 2)
  );
}

async function createAssetsFolder(name) {
  const assetsPath = path.join(getMyTemplatePath(name), "assets");
  const exist = await checkDirExists(assetsPath);
  if (!exist) {
    fs.mkdirSync(assetsPath);
  }
}

async function saveTemplateAsset(name, filename, buf) {
  const assetsPath = path.join(getMyTemplatePath(name), "assets");
  await fsPromise.writeFile(path.join(assetsPath, filename), buf);
}

// utils
function getMyTemplatePath(name) {
  const userDataPath = app.getPath("userData");

  const myTemplatesDir = path.join(userDataPath, "my-uploads", "my-templates");
  if (!fs.existsSync(myTemplatesDir)) {
    fs.mkdirSync(myTemplatesDir);
  }

  const templateDirPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    name
  );

  if (!fs.existsSync(templateDirPath)) {
    fs.mkdirSync(templateDirPath);
  }

  return templateDirPath;
}

async function getTemplateDir(name) {
  const userDataPath = app.getPath("userData");

  const templateDirPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    name
  );

  return templateDirPath;
}

async function doesTemplateDirExist(dirName) {
  const templateDirPath = await getTemplateDir(dirName);

  console.log(templateDirPath);
  return await checkDirExists(templateDirPath);
}

async function getNextTemplateName(name) {
  for (let i = 1; i < 1000; i++) {
    const newName = name + "-" + i;
    const exist = await doesTemplateDirExist(newName);
    if (!exist) {
      return newName;
    }
  }
  return "Error-ToManyFilenamesWithSameName";
}
module.exports = {
  loadTemplate,
  loadTemplates,
  saveTemplates,
  //loadTemplateExport,
  //loadTemplateExports,
  //saveTemplateExports,
  doesTemplateDirExist,
  getNextTemplateName,
  saveTemplateProject,
  getMyTemplatePath,
  saveTemplateExport,
  saveTemplateAsset,
  createAssetsFolder,
};
