const { ipcMain, BrowserWindow, app } = require("electron");
const { remove, chunk, omit } = require("lodash");
const { v4: uuid } = require("uuid");
const url = require("url");
const path = require("path");
const sanitize = require("sanitize-filename");
const JSZip = require("jszip");
const fsPromise = require("fs/promises");
const { downloadToBuffer, fileToBuffer } = require("../../utils/utils");
const { loadLicenseData } = require("../license/license");

const {
  type2MediaFolder,
  processTemplate,
  loadMyMedia,
  saveMyMedia,
} = require("../my-uploads/my-uploads-utils");

ipcMain.handle("Templates::GetRemoteTemplate", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { id } = data;

  const template = await loadRemoteTemplate(id);

  return { template };
});

ipcMain.handle("Templates::UninstallRemoteTemplate", async (event, reqJson) => {
  const { id } = JSON.parse(reqJson);

  if (!id) return;
  // remove from DB
  const templates = await loadMyMedia("remote-template");

  console.log(templates);
  const templateToDelete = templates.find((item) => {
    return item.id === id;
  });

  // NOTE: this should not happen, its there for preventing strange behavior
  if (!templateToDelete) return;

  const newTemplates = templates.filter((item) => {
    return item.id !== id;
  });

  saveMyMedia("remote-template", newTemplates);

  //  delete template folder and zip
  const userDataPath = app.getPath("userData");
  const myTemplateZipPath = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder("remote-template"),
    id + ".zip"
  );
  await fsPromise.rm(myTemplateZipPath, { force: true });
  const myTemplateDirPath = path.join(
    userDataPath,
    "my-uploads",
    type2MediaFolder("remote-template"),
    id
  );
  await fsPromise.rm(myTemplateDirPath, { recursive: true, force: true });

  return templateToDelete;
});

ipcMain.handle("Templates::GetInstalledRemoteTemplates", async (event) => {
  const templates = await loadMyMedia("remote-template");

  return { items: templates };
});

ipcMain.handle("Templates::InstallRemoteTemplate", async (event, reqJson) => {
  const templateData = JSON.parse(reqJson);

  console.log(templateData);

  // 1. add script
  const license = await loadLicenseData();
  let res = {};
  if (license?.license?.licenseDetails) {
    res = JSON.parse(atob(license.license.licenseDetails));
  }

  const fullPackageUrl = `${templateData.packageUrl}?api-key=${res.apiKey}`;
  const zipPackage = await downloadToBuffer(fullPackageUrl);

  const item = await processTemplate(
    zipPackage.toString("base64"),
    "remote-template",
    templateData
  );

  console.log("==");

  console.log(item);
  if (!item) {
    return {
      status: "ERROR",
      errorMessage: "Template with same id already exist",
    };
  }

  let myMedia = await loadMyMedia("remote-template");
  myMedia.push(item);
  saveMyMedia("remote-template", myMedia);

  return { status: "OK" };
});

async function loadRemoteTemplate(id) {
  const userDataPath = app.getPath("userData");
  const myTemplateZipPath = path.join(
    userDataPath,
    "my-uploads",
    "my-remote-templates",
    id,
    "project.json"
  );
  const projectStr = await fsPromise.readFile(myTemplateZipPath, "utf-8");

  const template = JSON.parse(projectStr);

  return template;
}
