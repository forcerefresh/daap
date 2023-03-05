const { app, ipcMain } = require("electron");
var path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const fsPromise = require("fs/promises");
const { checkFileExists } = require("../../utils/utils");
const fetch = require("node-fetch");

ipcMain.handle("License::GetLicenseDetails", async (event, reqJson) => {
  const license = await loadLicenseData();
  let res = {};
  if (license?.license?.licenseDetails)
    res = JSON.parse(atob(license.license.licenseDetails));

  return res;
});

ipcMain.handle("License::SaveSerialAndLicense", async (event, reqJson) => {
  const license = JSON.parse(reqJson);

  const uniqueKey = getUniqueLicenseKey();

  const transferQuery = license.allowTransfer ? "&allow-transfer=1" : "";
  let licenseData = await fetch(
    `https://subscriptions.webslider.io/check-subscription?subscription-id=${license.serial}&unique-key=${uniqueKey}` +
      transferQuery
  ).then((data) => data.json());

  license.license = licenseData;

  const existingLicense = await loadLicenseData();

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

function getUniqueLicenseKey() {
  const userDataPath = app.getPath("userData");
  const dirPath = path.join(userDataPath, "license");
  const filePath = path.join(dirPath, "unique.json");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ unique: uuid() }));
  }

  const str = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(str);
  return data.unique;
}

async function saveLicenseData(license) {
  await fsPromise.writeFile(
    getLicensePath(),
    JSON.stringify(license, undefined, 2)
  );
}

module.exports = {
  loadLicenseData,
  getUniqueLicenseKey,
};
