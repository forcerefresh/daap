const { app, ipcMain } = require("electron");
var path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists } = require("../../utils/utils");

ipcMain.handle("Presets::Get", async (event, reqJson) => {
  const { type } = JSON.parse(reqJson);

  const presets = await loadPresets(type);

  return presets;
});

ipcMain.handle("Presets::Add", async (event, reqJson) => {
  const { type, preset } = JSON.parse(reqJson);

  const presets = await loadPresets(type);

  presets.push(preset);

  await savePresets(type, presets);

  return presets;
});

ipcMain.handle("Presets::Update", async (event, reqJson) => {
  const { type, preset } = JSON.parse(reqJson);

  const presets = await loadPresets(type);

  let presetItem = presets.find((p) => p.uid === preset.uid);
  let presetItemIndex = presets.indexOf(presetItem);
  presets[presetItemIndex].value = preset.value;

  await savePresets(type, presets);

  return presets;
});

ipcMain.handle("Presets::Delete", async (event, reqJson) => {
  const { type, uid } = JSON.parse(reqJson);

  const items = await loadPresets(type);

  const newPresets = items.filter((curr) => curr.uid !== uid);

  await savePresets(type, newPresets);

  return newPresets;
});

// ======

async function loadPresets(type) {
  const presetsPath = getPresetsPath(type);

  const exist = await checkFileExists(presetsPath);
  let items = [];
  if (exist) {
    const str = await fsPromise.readFile(presetsPath, "utf-8");
    items = JSON.parse(str);
  } else {
    await fsPromise.writeFile(presetsPath, "[]", "utf-8");
  }

  return items;
}

function getPresetsPath(type) {
  const userDataPath = app.getPath("userData");
  const presetsDir = path.join(userDataPath, "presets");
  if (!fs.existsSync(presetsDir)) {
    fs.mkdirSync(presetsDir);
  }
  return path.join(userDataPath, "presets", "presets-" + type + ".json");
}

async function savePresets(type, items) {
  await fsPromise.writeFile(
    getPresetsPath(type),
    JSON.stringify(items, undefined, 2)
  );
}
