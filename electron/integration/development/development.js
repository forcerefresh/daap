const { app, ipcMain } = require("electron");
var path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists } = require("../../utils/utils");

ipcMain.handle(
  "Development::GetAllDevelopmentItems",
  async (event, reqJson) => {
    const items = await loadDevelopmentItems();
    return items;
  }
);

ipcMain.handle("Development::AddDevelopmentItem", async (event, reqJson) => {
  const items = await loadDevelopmentItems();
  const item = JSON.parse(reqJson);

  items.push(item);

  await saveDevelopmentItems(items);

  return items;
});

ipcMain.handle("Development::UpdateDevelopmentItem", async (event, reqJson) => {
  const items = await loadDevelopmentItems();
  const item = JSON.parse(reqJson);

  const itemIndex = items.findIndex((curr) => curr.id === item.id);
  items[itemIndex] = { ...items[itemIndex], ...item };

  await saveDevelopmentItems(items);

  return items;
});

ipcMain.handle("Development::DeleteDevelopmentItem", async (event, reqJson) => {
  const items = await loadDevelopmentItems();
  const { id } = JSON.parse(reqJson);

  const newItems = items.filter((curr) => curr.id !== id);

  await saveDevelopmentItems(newItems);

  return newItems;
});

// ======

async function loadDevelopmentItems() {
  const devItemsPath = getAppDevelopmentItemsPath();

  const exist = await checkFileExists(devItemsPath);
  let items = [];
  if (exist) {
    const str = await fsPromise.readFile(devItemsPath, "utf-8");
    items = JSON.parse(str);
  } else {
    await fsPromise.writeFile(devItemsPath, "[]", "utf-8");
  }

  return items;
}

function getAppDevelopmentItemsPath() {
  const userDataPath = app.getPath("userData");
  const developmentDir = path.join(userDataPath, "development");
  if (!fs.existsSync(developmentDir)) {
    fs.mkdirSync(developmentDir);
  }
  return path.join(userDataPath, "development", "development.json");
}

async function saveDevelopmentItems(items) {
  await fsPromise.writeFile(
    getAppDevelopmentItemsPath(),
    JSON.stringify(items, undefined, 2)
  );
}
