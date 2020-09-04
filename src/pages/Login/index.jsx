import React, { Component } from "react"
import LoginForm from "./components/LoginForm"

import "./index.less"
import logo from "@/assets/images/logo.png"

export default class Login extends Component {
  render() {
    return (
      <div className="login">
        <div className="login-container">
          <div className="login-header">
            <img src={logo} alt="logo" />
            <h1>硅谷教育管理系统</h1>
          </div>
          <div className="login-content">
            <LoginForm />
          </div>
          {/* <div className="login-footer">
            <span>尚硅谷</span>
            <span>
              Copyright <CopyrightOutlined /> 2020尚硅谷前端技术部出品
            </span>
          </div> */}
        </div>
      </div>
    )
  }
}
