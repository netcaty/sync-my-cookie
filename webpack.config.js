const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const webpack = require('webpack');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = [
  create('./src/popup.tsx'),
  create('./src/options.tsx'),
  create('./src/background.ts'),
];

function create(file) {
  const parsed = path.parse(file);
  const name = parsed.name;
  const ext = parsed.ext;
  const plugins = [
    new LodashModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      fetch: ['whatwg-fetch', 'default'],
    }),
  ];
  if (ext === '.tsx') {
    plugins.push(new HtmlWebpackPlugin({
      filename: `${name}.html`,
      inject: false,
      template: require('html-webpack-template'),
      appMountId: 'root',
      title: 'SyncMyCookie'
    }));
  }
  if (isProduction) {
    plugins.push(new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[name].[contenthash:8].chunk.css',
    }));
  }
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : false,
    entry: file,
    output: {
      filename: `${name}.js`,
      path: path.resolve(__dirname, './build'),
    },
    cache: true,
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            { loader: 'babel-loader' },
            { loader: 'awesome-typescript-loader' },
          ]
        },
        {
          test: /\.css$/,
          use: getStyleLoaders({ importLoaders: 1 }),
        },
        {
          test: /\.(scss|sass)$/,
          exclude: /\.module\.(scss|sass)$/,
          use: getStyleLoaders({ importLoaders: 2 }, 'sass-loader'),
        },
        {
          test: /\.module\.(scss|sass)$/,
          use: getStyleLoaders({
            importLoaders: 2,
            modules: true,
            localIdentName: '[name]__[local]__[hash:base64:5]'
          }, 'sass-loader'),
        },
        {
          test: /.less$/,
          use: getStyleLoaders({ importLoaders: 2 }, 'less-loader', { javascriptEnabled: true }),
        },
      ],
    },
    plugins,
  };
};

function getStyleLoaders(cssOptions, preProcessor, preProcessorOptions) {
  const loaders = [
    isProduction ? { loader: MiniCssExtractPlugin.loader } : 'style-loader',
    { loader: 'css-loader', options: cssOptions },
    { loader: 'postcss-loader', options: { ident: 'postcss' } },
  ];
  if (preProcessor) {
    loaders.push({ loader: preProcessor, options: preProcessorOptions });
  }
  return loaders;
};
