const { ipcMain } = require("electron");
const { remove } = require("lodash");
const { v4: uuid } = require("uuid");
const {
  loadTemplate,
  loadTemplates,
  saveTemplates,
  saveTemplateExports,
  loadTemplateExports,
} = require("./template-utils");

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

  const templates = await loadTemplates();

  const id = uuid();
  const created = new Date().getTime();
  const saveRevision = 1;

  templates.push({
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
  });

  await saveTemplates(templates);

  // player data
  const exps = await loadTemplateExports();
  playerData.name = name;
  exps[id] = playerData;
  await saveTemplateExports(exps);

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
