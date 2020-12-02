const path = require("path");
require('dotenv').config({
  path: path.join(__dirname, 'ambiente.env')
});

const { HotModuleReplacementPlugin, ExternalsPlugin } = require("webpack");
const HtmlMinizerPlugin = require("html-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const modulosNode = require("module").builtinModules;

const configPrincipal = {
  entry: "./src/gui/Main.tsx",
  mode: process.env.NODE_ENV,
  target: "electron-renderer",
  output: {
    path: path.join(__dirname, 'public/js/'),
    filename: "[name]-[fullhash].chunk.js",
  },
  module: {
    /* sucrase converte jsx para js de forma pura, sem adicionar polifyll, gerando ganho de peformance */
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(ts|tsx)$/,
        loader: "@sucrase/webpack-loader",
        options: {
          transforms: ["jsx", "typescript", "imports"],
        },
      }, 
      {
        test: /\.(css)$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devServer: {
    contentBase: "./public",
    publicPath: "./src/appAssets",
    port: 8000,
    compress: true,
    writeToDisk: true,
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  devtool: "inline-source-map",
  plugins: [
    new CleanWebpackPlugin({
      dry: true,
      dangerouslyAllowCleanPatternsOutsideProject: true,
    }),
    new ExternalsPlugin("commonjs", [...modulosNode, "electron",
  "hasha", "better-sqlite3"]),
    new HtmlWebpackPlugin({
      template: "./public/template.html",
      filename: "../index.html",
    }),
    new HotModuleReplacementPlugin(),
  ],

  optimization: {
    minimize: (process.env.NODE_ENV === 'production'),
    minimizer: [
      new HtmlMinizerPlugin(),
      new TerserPlugin()
    ],
    splitChunks: {
      chunks: "all",
    },
  },
};

module.exports = configPrincipal;
