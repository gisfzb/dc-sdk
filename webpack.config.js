/**
 * @Author: Caven
 * @Date: 2020-01-18 19:22:23
 */

const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const JavaScriptObfuscator = require('webpack-obfuscator')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const cesiumBuild = 'node_modules/cesium/Build/Cesium'
const cesiumDist = 'libs/dc-sdk/'

let cesiumCopyPlugin = [
  new CopyWebpackPlugin([
    { from: path.join(cesiumBuild, 'Assets'), to: 'resources/Assets' }
  ]),
  new CopyWebpackPlugin([
    { from: path.join(cesiumBuild, 'Workers'), to: 'resources/Workers' }
  ]),
  new CopyWebpackPlugin([
    { from: path.join(cesiumBuild, 'ThirdParty'), to: 'resources/ThirdParty' }
  ]),
  new CopyWebpackPlugin([
    { from: path.join('demo', 'index.html'), to: '../../index.html' }
  ])
]

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = env => {
  const IS_PROD = (env && env.production) || false
  const publicPath = IS_PROD ? '/' : '/'
  let plugins = [
    ...cesiumCopyPlugin,
    new MiniCssExtractPlugin({
      filename: IS_PROD ? '[name].min.css' : '[name].css',
      allChunks: true
    })
  ]
  if (IS_PROD) {
    plugins.push(new OptimizeCssAssetsPlugin())
    plugins.push(new webpack.NoEmitOnErrorsPlugin())
    plugins.push(
      new JavaScriptObfuscator(
        {
          rotateStringArray: true
        },
        []
      )
    )
  }
  return {
    entry: {
      'dc.core': ['theme', 'entry']
    },
    devtool: IS_PROD ? false : 'cheap-module-eval-source-map',
    output: {
      filename: IS_PROD ? '[name].min.js' : '[name].js',
      path: path.resolve(__dirname, 'dist/'+cesiumDist),
      publicPath: publicPath,
      library: 'DcCore',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    module: {
      unknownContextCritical: false,
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/transform-runtime'],
            compact: false,
            ignore: ['checkTree']
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 20000
          }
        },
        {
          test: /\.glsl$/,
          loader: 'webpack-glsl-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.json', '.css'],
      alias: {
        '@': resolve('src'),
        entry: './src/core/index.js',
        theme: './src/themes/index.js',
        cesium: path.resolve(__dirname, cesiumBuild)
      }
    },
    plugins
  }
}
