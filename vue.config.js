const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: [{
          provider: "github",
          owner: "domolearczyk",
          repo: "print-app"
        }]
      }
    }
  }
})
