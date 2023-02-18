//require("dotenv").config();
const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  console.log("notarizing...");
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    console.log("notarizing aaa...");

    return;
  }
  console.log("notarizing 2...");

  const appName = context.packager.appInfo.productFilename;
  const appBundleId = "io.forcerefresh.webslider";
  const appPath = `${appOutDir}/${appName}.app`;
  const appleId = "jelena.arsic@forcerefresh.io";
  const appleIdPassword = "khwp-yajw-uwfo-ypit";

  console.log({
    appBundleId,
    appPath,
    appleId,
    appleIdPassword,
  });
  //   return await notarize({
  //     appBundleId: "com.yourcompany.yourAppId",
  //     appPath: `${appOutDir}/${appName}.app`,
  //     appleId: process.env.APPLEID,
  //     appleIdPassword: process.env.APPLEIDPASS,
  //   });
  //   import { notarize } from '@electron/notarize';

  //   // Package your app here, and code sign with hardened runtime
  await notarize({
    tool: "notarytool",
    appBundleId,
    appPath,
    appleId,
    appleIdPassword,
  });
};
