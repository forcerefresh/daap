const { ipcMain } = require("electron");
const { forEach, remove } = require("lodash");
const {
  loadProject,
  loadProjects,
  saveProjects,
  saveExports,
  loadExports,
} = require("./project-utils");
const { v4: uuid } = require("uuid");

ipcMain.handle("Projects::SaveProject", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const {
    name,
    description,
    slides,
    project,
    preview,
    playerData,
    assetsUrls,
    fonts,
    extensions,
  } = data;

  let { id, created } = data;

  const projects = await loadProjects();

  let projectItem;
  let projectItemIndex = -1;
  if (!id) {
    id = uuid();
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
      fonts,
      extensions,
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
      fonts,
      extensions,
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
    fonts,
    //publishRevision,
  };
});

ipcMain.handle("Projects::GetProjects", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { from, search, perPage } = data;

  const projects = await loadProjects();

  projects.reverse();

  const retArr = projects.splice(from, perPage);

  return { projects: retArr };
});

ipcMain.handle("Projects::DeleteProject", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { id } = data;

  const projects = await loadProjects();

  remove(projects, (project) => {
    return project.id === id;
  });

  await saveProjects(projects);

  const exports = await loadExports();
  delete exports[id];
  await saveExports(exports);

  return { id };
});

ipcMain.handle("Projects::GetProject", async (event, dataStr) => {
  const data = JSON.parse(dataStr);
  const { id } = data;

  const project = await loadProject(id);

  return { project };
});

// ipcMain.handle("Projects::GetNextProjectId", async (event) => {
//   const projects = await loadProjects();

//   let maxId = 1;

//   projects.forEach((p) => {
//     maxId = Math.max(maxId, p.id);
//   });

//   return maxId + 1;
// });
