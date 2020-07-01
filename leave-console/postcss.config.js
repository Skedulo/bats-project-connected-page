let purgecss = []
/**
 * We are only want to run purgecss on production bundles.
 * This  lowers overhead while developing but also makes all tailwind
 * classes fully available while working on storybook.
 * 
 * We need to supply an extractor to purgecss to tell it not to remove
 * legimate tailwind/BEM classes that use special but valid characters, such as
 * hover:bg-blue
 */

if (process.env.NODE_ENV === 'production') {
  purgecss = [
    require('@fullhuman/postcss-purgecss')({
      content: ['**/*.tsx'],
      extractors: [
        {
          extractor: class {
            static extract(content) {
              return content.match(/[A-Za-z0-9-_:\/]+/g) || []
            }
          },
            extensions: ['.ts','.tsx']
        }
      ]
    })
  ]
}

module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-inline-svg')(),
    require('tailwindcss')('./tailwind.config.js'),
    ...purgecss
  ]
}