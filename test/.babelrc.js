module.exports = function(api) {
  const result = require('../.babelrc.js')(api)
  return {
    ...result,
    plugins: [
      ...result.plugins,
      ['babel-plugin-flow-runtime', { assert: false, annotate: false }],
    ],
  }
}
