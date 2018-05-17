const path = require("path");
const webpack = require("webpack");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const dist = path.join(__dirname, '.', 'public');
console.log(dist);
module.exports = {
  entry: {
    main: "./public/javascripts/ditagis/main.js",
    cattachthua: "./public/javascripts/ditagis/cattachthua.js",
    congtacvien: "./public/javascripts/ditagis/congtacvien.js"
  },
  output: {
    path: dist,
    filename: '[name].bundle.js',
    publicPath: '/',
    libraryTarget: "amd"
  },
  module: {
    rules: [
      // {
      //   test: /\.tsx?$/,
      //   loader: "ts-loader",
      //   options: {
      //     transpileOnly: true
      //   }
      // },
      {
        test: /\.js?$/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env']
            ]
          }
        }
      }
    ]
  },
  plugins: [
    // new UglifyJSPlugin({
    //   sourceMap: false,
    //   uglifyOptions: {
    //     ie8: false,
    //     ecma: 8,
    //     output: {
    //       comments: false,
    //       beautify: false
    //     },
    //     warnings: false
    //   }
    // })
  ],
  resolve: {
    modules: [path.resolve(__dirname, "/src")],
    extensions: [".js"]
  },
  externals: [
    (context, request, callback) => {
      if (
        /^dojo/.test(request) ||
        /^esri/.test(request)
      ) {
        return callback(null, "amd " + request);
      }
      callback();
    }
  ]
};
