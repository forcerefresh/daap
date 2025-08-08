let ext: {
  addExtensionCode: (type: string, version?: string) => Promise<void>;
} = {
  addExtensionCode: (type: string, version?: string) => Promise.resolve(),
};
if (import.meta.env.VITE_APP_INTEGRATION === "saas") {
  ext = require("./saas-load-extension");
} else if (import.meta.env.VITE_APP_INTEGRATION === "electron") {
  ext = require("./electron-load-extension");
} else {
  ext = require("./load-extension");
}

export const addExtensionCode = ext.addExtensionCode;
