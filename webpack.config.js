const path = require('path');

module.exports = {
    entry: './src/main.js',
    output: {
      filename: 'eka.js',
      path: path.resolve(__dirname, 'dist/js'),
      library: 'Eka'
    }
  };