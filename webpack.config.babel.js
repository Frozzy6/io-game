const webpack = require('webpack');
const path = require('path');
const chalk = require('chalk');

const ENV = process.env.NODE_ENV || 'development';

console.log(`${chalk.cyan('Webpack building for')}: ${chalk.bold.red(ENV)}`);

module.exports = {
  mode: 'development',
  entry: {
    main: ['./src/client/app.js'],
  },
  output: {
    path: path.resolve(__dirname, './src/server/public/'),
    filename: './js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/, /axios$/),
  ],
  stats: { colors: true },
};
