module.exports = {
  entry: './src/game.js',
  output: {
    path: './dist',
    filename: 'randomzelda.js',
    libraryTarget: 'var',
    library: 'Game'
  },
  resolve: {
    extensions: ['', '.js']
  }
};
