const { app, ipcMain } = require("electron");
var path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises");
const { checkFileExists } = require("../../utils/utils");

ipcMain.handle("License::GetLicenseDetails", async (event, reqJson) => {
  const license = await loadLicenseData();
  let res = {};
  if (license?.license?.licenseDetails)
    res = JSON.parse(atob(license.license.licenseDetails));

  return res;
});

ipcMain.handle("License::SaveSerialAndLicense", async (event, reqJson) => {
  const existingLicense = await loadLicenseData();
  const license = JSON.parse(reqJson);

  const newLicense = { ...existingLicense, ...license };

  await saveLicenseData(newLicense);

  return newLicense;
});

// ======

async function loadLicenseData() {
  const licPath = getLicensePath();

  const exist = await checkFileExists(licPath);
  let licData = {};
  if (exist) {
    const str = await fsPromise.readFile(licPath, "utf-8");
    licData = JSON.parse(str);
  } else {
    await fsPromise.writeFile(licPath, "{}", "utf-8");
  }

  return licData;
}

function getLicensePath() {
  const userDataPath = app.getPath("userData");
  const licenseDir = path.join(userDataPath, "license");
  if (!fs.existsSync(licenseDir)) {
    fs.mkdirSync(licenseDir);
  }
  return path.join(userDataPath, "license", "license.json");
}

async function saveLicenseData(license) {
  await fsPromise.writeFile(
    getLicensePath(),
    JSON.stringify(license, undefined, 2)
  );
}

module.exports = {
  loadLicenseData,
};
