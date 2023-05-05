const webpack = require('webpack');

module.exports = {
  mode: "production",

  entry: "./src/ts/main.ts",

  resolve: {
    extensions: [".ts", ".js"],
  },

  output: {
    path: `${__dirname}/docs`,
    filename: "main.js"
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-typescript"
              ]
            }
          }
        ]
      }
    ]
  },
  target: ["web", "es5"],
  plugins: [
    new webpack.ProvidePlugin({
        process: 'process/browser',
    }),
  ],
};
