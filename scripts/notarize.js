//require("dotenv").config();
const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appBundleId = "io.forcerefresh.webslider";
  const appPath = `${appOutDir}/${appName}.app`;
  const appleId = "jelena.arsic@forcerefresh.io";
  const appleIdPassword = "twvx-ovny-ufiw-pkwn";
  const teamId = "L337ULATL3";

  await notarize({
    tool: "notarytool",
    appBundleId,
    appPath,
    appleId,
    appleIdPassword,
    teamId,
  });
};
