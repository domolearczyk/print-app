const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      preload: "./src/preload.js",
      builderOptions: {
        productName: "acut WMS Print App",
        win: {
          target: [
              "nsis"
          ],
          icon: "public/icons/icon.ico"
        },
        extraFiles: [{
          from: './ext/sumatra',
          to: '.'
        }],
        nsis: {
          installerIcon: "public/icons/icon.ico",
          uninstallerIcon: "public/icons/icon.ico",
          uninstallDisplayName: "acut WMS Print App",
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          include: './src/installer.nsh'
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
