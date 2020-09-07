var path = require('path');
var webpack = require('webpack');
module.exports = {
    watch: true,
    mode: 'development',
    entry: { 
       m: './public/master/livenote-master.js',
       s: './public/slave/livenote-client.js'
    },
    output: {
        path: path.resolve(__dirname, 'public/js/dist/'),
        filename: '[name].js',
        libraryTarget: 'umd'
    }
};