const path = require("path");

module.exports = {
  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./src/fe/mainVUE.js")
      .end();
    config.resolve.alias
      .set("@", path.join(__dirname, "./src/fe"))
  }
};
