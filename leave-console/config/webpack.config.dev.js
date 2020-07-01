const merge = require('webpack-merge')

const common = require('./webpack.config.common')
const paths = require('./paths')
const publicPath = ''

module.exports = merge(common, {
  mode: 'development',
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
  devServer: {
    contentBase: paths.appPublic,
    compress: true,
    host: 'localhost',
    port: 3000,
    clientLogLevel: 'none',
    hot: false,
    inline: false,
    noInfo: true,
    watchOptions: {
      poll: true,
      ignored: /node_modules/,
    },
    stats: "minimal",
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: publicPath,
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebookincubator/create-react-app/issues/387.
      disableDotRule: true,
    },
  }
})
