// This file contains configuration for development
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CreateHashFileWebpack = require("create-hash-file-webpack");

const PORT = 3005;
const MODULE_FILE_NAME_PLAYER = "video-source-unmute-player.js";
const MODULE_FILE_NAME_APP = "video-source-unmute-app.js";
const OBJECT_UID = "video-source-unmute";

// Common configuration for Object used in Player and App
const webpackCommon = {
  devtool: "source-map",
  mode: "development",
  module: {
    rules: [
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
};

// Configuration for Development
const webpackDev = {
  entry: [
    path.resolve(__dirname, "index-player.ts"),
    path.resolve(__dirname, "index-app.ts"),
  ],
  ...webpackCommon,
  devtool: "source-map",
  mode: "development",
  devServer: {
    hot: false,
    liveReload: false,
    static: "./static",
    port: PORT,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
  plugins: [
    new CreateHashFileWebpack([
      {
        path: "./static",
        fileName: "hash.json",
        content: `{"hash":"[hash]"}`,
      },
    ]),
    new HtmlWebpackPlugin({
      template: "static/index.html",
      templateParameters: {
        port: PORT,
        filenamePlayer: MODULE_FILE_NAME_PLAYER,
        filenameApp: MODULE_FILE_NAME_APP,
        objectUid: OBJECT_UID,
      },
    }),
  ],
};

// Configuration for Object used in Web Slider App
const webpackApp = {
  entry: path.resolve(__dirname, "index-app.ts"),
  ...webpackCommon,
  output: {
    filename: MODULE_FILE_NAME_APP,
  },
};

// Configuration for object used in Web Slider Player
const webpackPlayer = {
  entry: path.resolve(__dirname, "index-player.ts"),
  ...webpackCommon,
  output: {
    filename: MODULE_FILE_NAME_PLAYER,
  },
};

module.exports = [webpackDev, webpackApp, webpackPlayer];
