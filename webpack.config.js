const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    module: {
      rules: [
        { 
          test: /\.css$/, 
          use: ExtractTextPlugin.extract({
            //fallback: "style-loader",
            use: "css-loader"
          }) 
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin("../css/styles.css")
    ],
    entry: {
      ledsBlink: './src/one/main.js',
      ifElseLogic: './src/two/main.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist/js'),
      library: 'Eka'
    }
  };