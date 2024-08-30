const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'examples/src/main.js',
      template: 'public/index.html',
    }
  },
  css: { extract: false },
  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  }
})
