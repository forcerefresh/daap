let ext: {
  addExtensionCode: (type: string) => Promise<void>;
} = {
  addExtensionCode: (type: string) => Promise.resolve(),
};

if (process.env.REACT_APP_INTEGRATION === "electron") {
  ext = require("./electron-load-extension");
} else {
  ext = require("./load-extension");
}

export const addExtensionCode = ext.addExtensionCode;
