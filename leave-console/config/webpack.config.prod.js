const merge = require('webpack-merge')
const common = require('./webpack.config.common')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyWebpackPlugin([
      { from: 'assets/fonts', to: 'static/fonts', ignore: ['*.css'] }
    ])
  ]
})
