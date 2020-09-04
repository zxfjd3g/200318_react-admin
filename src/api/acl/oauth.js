import request from "@/utils/request"

const BASE_URL = "/oauth"

// 发送验证码
export function reqSendCode(mobile) {
  return request({
    url: `${BASE_URL}/sign_in/digits`,
    method: "POST",
    data: {
      mobile,
    },
  })
}

// 手机号登录
export function reqMobileLogin(mobile, code) {
  return request({
    url: `${BASE_URL}/mobile`,
    method: "POST",
    data: {
      mobile,
      code,
    },
  })
}
