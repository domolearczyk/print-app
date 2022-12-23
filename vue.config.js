const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: "acut WMS Print App",
        win: {
          target: [
              "nsis"
          ],
          icon: "public/icons/icon.ico"
        },
        nsis: {
          installerIcon: "public/icons/icon.ico",
          uninstallerIcon: "public/icons/icon.ico",
          uninstallDisplayName: "acut WMS Print App",
          oneClick: false,
          allowToChangeInstallationDirectory: true
        },
        publish: [{
          provider: "github",
          owner: "domolearczyk",
          repo: "print-app"
        }],
      }
    }
  }
})
