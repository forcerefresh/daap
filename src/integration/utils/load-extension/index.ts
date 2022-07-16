let ext: {
  addExtensionCode: (type: string) => Promise<void>;
} = {
  addExtensionCode: (type: string) => Promise.resolve(),
};

if (process.env.REACT_APP_INTEGRATION === "electron") {
  //ext = require("./electron-local-media");
} else {
  ext = require("./load-extensison");
}

export const addExtensionCode = ext.addExtensionCode;
