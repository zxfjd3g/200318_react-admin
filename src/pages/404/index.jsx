import React, { Component } from "react"
import { connect } from "react-redux"
import { Result, Button } from "antd"

@connect((state) => ({ token: state.token }))
class NotFound extends Component {
  goPage = () => {
    this.props.history.push(this.props.token ? "/" : "/login")
  }

  render() {
    const { token } = this.props

    return (
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您请求的页面不存在或您无权限查看"
        extra={
          <Button type="primary" onClick={this.goPage}>
            {token ? "去首页" : "去登录"}
          </Button>
        }
      />
    )
  }
}

export default NotFound
