const { ipcMain, BrowserWindow, app } = require("electron");
const { remove, chunk, omit } = require("lodash");
const { v4: uuid } = require("uuid");
const url = require("url");
const path = require("path");
const sanitize = require("sanitize-filename");
const JSZip = require("jszip");
const fsPromise = require("fs/promises");
const {
  downloadToBuffer,
  fileToBuffer,
  getMyImagesPath,
  getMyVideosPath,
} = require("../../utils/utils");
const {
  loadTemplate,
  loadTemplates,
  saveTemplates,
  // saveTemplateExports,
  // loadTemplateExports,
  doesTemplateDirExist,
  getNextTemplateName,
  saveTemplateProject,
  saveTemplateExport,
  saveTemplateAsset,
  createAssetsFolder,
} = require("./template-utils");

const PARALLEL_DOWNLOAD = 5;

ipcMain.handle("Templates::SaveTemplate", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const {
    name,
    description,
    slides,
    project,
    preview,
    playerData,
    assetsUrls,
    extensions,
  } = data;

  let uniqueTemplateName = await getTemplateName(name);
  const id = uniqueTemplateName;
  const created = new Date().getTime();
  const saveRevision = 1;

  const template = {
    id,
    name,
    description,
    slides,
    created,
    project,
    preview,
    saveRevision,
    assetsUrls,
    extensions,
  };

  // save template >>
  const zip = new JSZip();
  saveTemplateProject(uniqueTemplateName, template);
  zip.file(
    "project.json",
    Buffer.from(JSON.stringify(template, undefined, 2), "utf-8")
  );
  // save template <<

  // save export >>
  playerData.name = name;
  saveTemplateExport(uniqueTemplateName, playerData);
  zip.file(
    "export.json",
    Buffer.from(JSON.stringify(playerData, undefined, 2), "utf-8")
  );
  // save export

  // copy assets and prepare zip >>
  if (template.assetsUrls.length > 0) {
    await createAssetsFolder(uniqueTemplateName);
  }
  const assetsUrlsChunks = chunk(template.assetsUrls, PARALLEL_DOWNLOAD);

  const assetsResult = []; // from-to (for search/replace)
  let error;
  for (const assetsUrlsChunk of assetsUrlsChunks) {
    const pArr = [];
    const processedAssetItems = [];
    for (const assetItem of assetsUrlsChunk) {
      // NOTE: consider implementations
      // if (assetItem.sourceType === "library") {
      //   pArr.push(downloadToBuffer(assetItem.url));
      // }
      if (assetItem.sourceType === "local") {
        console.log(assetItem);
        const assetRoot =
          assetItem.mediaType === "video"
            ? getMyVideosPath()
            : assetItem.mediaType === "image"
            ? getMyImagesPath()
            : undefined;

        console.log("assetRoot:" + assetRoot);

        if (assetRoot) {
          pArr.push(
            fileToBuffer(path.join(assetRoot, assetItem.localFilename))
          );
          processedAssetItems.push(assetItem);
        }
      }
    }

    try {
      const bufferArr = await Promise.all(pArr);

      bufferArr.forEach((buf, idx) => {
        const assetItem = processedAssetItems[idx];
        let filename;

        // NOTE: consider implementations
        // if (assetItem.sourceType === "library") {
        //   var parsed = url.parse(assetItem.url);
        //   filename = path.basename(parsed.pathname);
        //   if (assetsUrlsChunk[idx].filename) {
        //     filename = assetsUrlsChunk[idx].filename;
        //   }

        //   assetsResult.push({
        //     fromUrl: assetItem.url,
        //     toUrl: `assets/${filename}`,
        //   });
        // }

        if (assetItem.sourceType === "local") {
          filename = assetItem.filename || assetItem.localFilename;

          assetsResult.push({
            fromUrl: "file://" + assetItem.localFilename,
            toUrl: `assets/${filename}`,
          });
        }

        saveTemplateAsset(uniqueTemplateName, filename, buf);

        const assetZipFilePath = path.join("assets", filename);
        zip.file(assetZipFilePath, buf);

        BrowserWindow.getAllWindows()[0].webContents.send(
          `ObjectStorageRenderer::SubscribeToPublishDetails`,
          JSON.stringify([{ log: `Copy asset file to template: ${filename}` }])
        );
      });
    } catch (ex) {
      console.log(ex);
      error = ex.toString();
      break;
    }
  }

  // SAVE zip
  const userDataPath = app.getPath("userData");
  const myTemplateZipPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    uniqueTemplateName + ".zip"
  );

  const zipBuff = await zip.generateAsync({ type: "nodebuffer" });
  await fsPromise.writeFile(myTemplateZipPath, zipBuff);

  if (error) {
    return { status: "ERROR", error };
  }
  // copy assets and prepare zip <<

  // save to list
  const templates = await loadTemplates();
  templates.push(omit(template, "project"));
  await saveTemplates(templates);
  // save to list

  // // player data
  // const exps = await loadTemplateExports();
  // playerData.name = name;
  // exps[id] = playerData;
  // await saveTemplateExports(exps);

  return {
    id: id,
    name,
    description: description,
    slides: slides,
    created: created.toString(),
    saveRevision,
    assetsUrls,
  };
});

ipcMain.handle("Templates::GetTemplates", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { from, search, perPage } = data;

  const templates = await loadTemplates();

  templates.reverse();

  const retArr = templates.splice(from, perPage);

  return { templates: retArr };
});

ipcMain.handle("Templates::DeleteTemplate", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { id } = data;

  const userDataPath = app.getPath("userData");
  const myTemplateZipPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    id + ".zip"
  );
  fsPromise.rm(myTemplateZipPath, { force: true });

  const myTemplateDirPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    id
  );
  fsPromise.rm(myTemplateDirPath, { recursive: true, force: true });

  const templates = await loadTemplates();

  remove(templates, (template) => {
    return template.id === id;
  });

  await saveTemplates(templates);

  return { id };
});

ipcMain.handle("Templates::GetTemplate", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { id } = data;

  const template = await loadTemplate(id);

  return { template };
});

ipcMain.handle("Templates::Download", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { id } = data;

  const userDataPath = app.getPath("userData");
  const myTemplateZipPath = path.join(
    userDataPath,
    "my-uploads",
    "my-templates",
    id + ".zip"
  );

  const zipFile = await fsPromise.readFile(myTemplateZipPath);

  return zipFile.toString("base64");
});

async function getTemplateName(originalName) {
  let name = sanitize(originalName);
  name = name.replace(" ", "-");
  name = name.toLowerCase();

  const nameExist = await doesTemplateDirExist(name);
  if (!nameExist) {
    return name;
  }

  return await getNextTemplateName(name);
}
