const path = require("path");

module.exports = {
  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./src/fe/vue.js")
      .end();
    config.resolve.alias
      .set("@", path.join(__dirname, "./src"))
      .set("@Lib", path.join(__dirname, "./lib"))
      .set("@FE", path.join(__dirname, "./src/fe"))
      .set('@BE', path.join(__dirname, "./src/be"))
      .end();
    config.output.publicPath(process.env.VUE_APP_PUBLIC_PATH)
  }
};
