const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists } = require("../../utils/utils.js");

async function loadTemplate(id) {
  const templates = await loadTemplates();

  const template = templates.find((p) => p.id === id);

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
  const templatesDir = path.join(userDataPath, "templates");
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir);
  }
  return path.join(userDataPath, "templates", "templates.json");
}

function getTemplateExportsPath() {
  const userDataPath = app.getPath("userData");
  const templatesDir = path.join(userDataPath, "templates");
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir);
  }
  return path.join(userDataPath, "templates", "exports.json");
}

async function loadTemplateExport(id) {
  const exports = await loadTemplateExports();

  return exports[id];
}

async function loadTemplateExports() {
  const exportsPath = getTemplateExportsPath();

  const exist = await checkFileExists(exportsPath);
  let exports = {};
  if (exist) {
    const exportsStr = await fsPromise.readFile(exportsPath, "utf-8");
    exports = JSON.parse(exportsStr);
  }

  return exports;
}

async function saveTemplateExports(exports) {
  await fsPromise.writeFile(
    getTemplateExportsPath(),
    JSON.stringify(exports, undefined, 2)
  );
}

module.exports = {
  loadTemplate,
  loadTemplates,
  saveTemplates,
  loadTemplateExport,
  loadTemplateExports,
  saveTemplateExports,
};
