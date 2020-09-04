import * as qiniu from "qiniu-js"

export default {
  // qiniu.region.z0: 代表华东区域
  // qiniu.region.z1: 代表华北区域
  // qiniu.region.z2: 代表华南区域
  // qiniu.region.na0: 代表北美区域
  // qiniu.region.as0: 代表东南亚区域
  region: qiniu.region.z2,
  // 视频访问前缀地址
  prefix_url: "http://qfvduovyk.hn-bkt.clouddn.com/",
  // prefix_url: "http://qe2hugc91.bkt.clouddn.com/",
}
