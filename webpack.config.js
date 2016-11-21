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
    },
    module: {
        preLoaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "jshint-loader"
        }]
    },
    jshint: {
        emitErrors: false,
        failOnHint: false,
    }
};
