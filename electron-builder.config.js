module.exports = {
  appId: "com.creativespace.utility",
  productName: "creative.space.utility",
  directories: {
    output: "release",
    buildResources: "assets"
  },
  files: [
    // Include the correct build output structure
    {
      from: "dist-electron/main",
      to: ".",
      filter: "**/*"
    },
    {
      from: "dist-electron/preload", 
      to: ".",
      filter: "**/*"
    },
    {
      from: "dist-electron/renderer",
      to: "renderer",
      filter: "**/*"
    },
    {
      from: "src/shared",
      to: "shared",
      filter: "**/*"
    },
    "package.json",
    "node_modules/**/*"
  ],
  asarUnpack: [
    "shared/**/*"
  ],
  mac: {
    target: {
      arch: ["arm64", "x64"],
      target: "dmg"
    },
    icon: "datasources/cs-utility.icns"
  },
  win: {
    target: "nsis",
    icon: "assets/icon.ico"
  },
  linux: {
    target: "AppImage",
    icon: "assets/icon.png"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
};
