const path = require("path");
const nodeExternals = require("webpack-node-externals");

const envToMode = (env) => {
  if (env.production) {
    return "production";
  }
  return "development";
};

module.exports = (env) => {
  console.log(env);
  return {
    entry: "./electron/main.js",
    devtool: "source-map",
    externals: [nodeExternals()],
    target: "node",
    mode: envToMode(env),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
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
      filename: "./electron.js",
      path: path.resolve(__dirname, "../build"),
    },
  };
};
