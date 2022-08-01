// This file contains configuration for production build
const path = require("path");

const MODULE_FILE_NAME_PLAYER = "video-source-player.js";

// Configuration for Object build used in Web Slider Player
module.exports = {
  entry: path.resolve(__dirname, "index-player.ts"),
  devtool: "source-map",
  mode: "production",
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
    filename: MODULE_FILE_NAME_PLAYER,
  },
};
