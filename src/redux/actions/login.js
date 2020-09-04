import { reqLogin, reqLogout } from "@/api/acl/login"
import { reqMobileLogin } from "@/api/acl/oauth"

import { LOGIN, REMOVE_TOKEN } from "../constants/login"

// 手机号密码登录
export const mobileLogin = (mobile, code) => {
  return (dispatch) => {
    // 执行异步代码~
    return reqMobileLogin(mobile, code).then(({ token }) => {
      dispatch(loginSync(token))
      return token
    })
  }
}

// 账户名密码登录
export const login = (username, password) => {
  return (dispatch) => {
    // 执行异步代码~
    return reqLogin(username, password).then(({ token }) => {
      dispatch(loginSync(token))
      return token
    })
  }
}

export const loginSync = (token) => ({
  type: LOGIN,
  data: token,
})

// 登出
export const logout = () => {
  return (dispatch) => {
    return reqLogout().then(() => {
      dispatch(removeToken())
    })
  }
}

// 删除token
export const removeToken = () => ({
  type: REMOVE_TOKEN,
})
