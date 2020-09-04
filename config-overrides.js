const {
  override,
  fixBabelImports,
  addLessLoader,
  addDecoratorsLegacy,
  addWebpackAlias,
  addWebpackPlugin,
  disableEsLint
} = require("customize-cra");

const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

const { resolve } = require("path");

function resolvePath(path) {
  return resolve(__dirname, "src", path);
}

module.exports = override(
  // 对antd实现按需引入打包
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true,
  }),
  // 修改antd中的主题色
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      "@primary-color": "#1DA57A",
    },
  }),
  // 装饰器
  addDecoratorsLegacy(),
  // 路径别名
  addWebpackAlias({
    "@": resolvePath("./"),
  }),

  // 使用dayjs替换掉antd中默认的moment
  addWebpackPlugin(new AntdDayjsWebpackPlugin()),

  // 禁用eslint检查
  disableEsLint()
);
