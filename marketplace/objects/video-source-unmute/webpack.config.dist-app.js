// This file contains configuration for production build
const path = require("path");
const WebpackStrip = require("strip-loader");

const MODULE_FILE_NAME_APP = "video-source-unmute-app.js";

// Configuration for object build used in Web Slider App
module.exports = {
  entry: path.resolve(__dirname, "index-app.ts"),
  devtool: "source-map",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: WebpackStrip.loader(
          // "logger.fatal", // this shoud be output in prod
          // "logger.error", // this shoud be output in prod
          "logger.trace",
          "logger.debug",
          "logger.info",
          "logger.notice",
          "logger.warn",
          "logger.add",
          "logger.flush"
        ),
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  output: {
    filename: MODULE_FILE_NAME_APP,
  },
};
