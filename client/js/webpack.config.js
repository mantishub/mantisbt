"use strict"

const path = require('path');

module.exports = {
  entry: './index.tsx',
  mode: 'production',
  output: {
    filename: 'mantis.js',
    path: path.resolve(__dirname, '../../js'),
    publicPath: '/'
  },
  devServer: {
    publicPath: '/',
    contentBase: './public',
    hot: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: 'inline-source-map',
  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      use: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }]
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false
  }
};
