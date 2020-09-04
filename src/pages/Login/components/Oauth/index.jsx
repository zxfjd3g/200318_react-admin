import React, { Component } from "react"
import { connect } from "react-redux"

import { loginSync } from "@/redux/actions/login"

@connect(null, { loginSync })
// 已经注册用户，并返回token，token位于地址栏的query参数
// 当前组件时任何用户都可以访问，所以添加到config/routes中常量路由中~
class Oauth extends Component {
  componentDidMount() {
    // 获取query参数中的token --> 相当于登录成功~
    const token = this.props.location.search.split("=")[1]
    // console.log(token)
    // 保存在redux中
    this.props.loginSync(token)
    // 保存在本地
    localStorage.setItem("user_token", token)
    // 跳转首页
    this.props.history.replace("/")
  }

  render() {
    return <div>授权登录中...</div>
  }
}
export default Oauth
