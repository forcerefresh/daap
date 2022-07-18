const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CreateHashFileWebpack = require("create-hash-file-webpack");

const PORT = 3007;
const MODULE_FILE_NAME = "video-source.js";
const OBJECT_UID = "video-source";

module.exports = {
  entry: path.resolve(__dirname, "index-app.ts"),
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
        filename: MODULE_FILE_NAME,
        objectUid: OBJECT_UID,
      },
    }),
  ],
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
  output: {
    filename: MODULE_FILE_NAME,
    path: path.resolve(__dirname, "build"),
  },
};
