import React, { useState, useEffect, useRef } from "react"
import { Form, Tabs, Input, Button, Checkbox, Row, Col, message } from "antd"
import {
  UserOutlined,
  LockOutlined,
  MobileOutlined,
  GithubOutlined,
  WechatOutlined,
  QqOutlined,
} from "@ant-design/icons"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import { login, mobileLogin } from "@/redux/actions/login"
import { reqSendCode } from "@/api/acl/oauth"
import { CLIENT_ID } from "@/config/oauth"

import "./index.less"

const { TabPane } = Tabs

// const reg = /^[a-zA-Z0-9_]+$/

//#region
/*
  表单校验有三种写法：
    1. rules(如果多个表单校验规则一模一样)
      <Form.Item
        name="username"
        rules={[
          { required: true, message: "请输入用户名" },
          { max: 15, message: "输入的长度不能超过15位" },
          { min: 4, message: "输入的长度不能小于4位" },
          {
            pattern: /^[a-zA-Z0-9_]+$/,
            message: "输入内容只能包含数字、英文和下划线",
          },
        ]}
      >
   2. 自定义校验规则 validator(如果多个表单校验规则有差异)
      <Form.Item
        name="username"
        rules={[
          { validator: validator },
        ]}
      > 
      const validator = (rule, value) => {}
        
    3. rules + validateMessages（校验规则一样，但是message信息不一样）
      主要目的是为了复用 messages

*/
//#endregion

const TOTAL_TIME = 60
// 倒计时
let countingDownTime = TOTAL_TIME

function LoginForm({ login, mobileLogin, history }) {
  // Form表单提供form对象，对表单进行更加细致的操作
  const [form] = Form.useForm()
  // 只需要更新组件的方法，不需要数据
  const [, setCountingDownTime] = useState(0)
  // 是否已经发送验证码
  const [isSendCode, setIsSendCode] = useState(false)

  const [activeKey, setActiveKey] = useState("user")
  const timerRef = useRef()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        console.log('--------')
        clearInterval(timerRef.current)
      }
    }
  }, [])



  // 处理tab点击的事件回调
  const handleTabChange = (key) => {
    setActiveKey(key)
  }

  // antd中第二种校验方式: 自定义校验
  const validator = (rule, value) => {
    return new Promise((resolve, reject) => {
      // rule 里面有字段名
      // value 是输入的值
      /* 
        用户名的校验规则: 
        1. 必填项
        2. 长度大于4个字符
        3. 长度不能超过16个字符
        4. 只能是字母,数字,下划线

        表单校验的触发时机: 输入内容的时候会触发,
        点击表单的提交按钮,提交前也会触发
      */
      if (!value) {
        return reject("请输入密码")
      }
      const len = value.length

      if (len > 15) {
        return reject("输入的长度不能超过15位")
      }

      if (len < 4) {
        return reject("输入的长度不能小于4位")
      }

      if (!/^[0-9a-zA-Z_]+$/.test(value)) {
        return reject('密码只能输入数字,字母,下划线')
      }

      resolve()
    })
  }

  // 定义公共校验规则
  const validateMessages = {
    /* eslint-disable-next-line */
    required: "请输入 ${name}!",
    // types: {
    //   username: "${name} is not validate email!",
    //   password: "${name} is not a validate number!",
    // },
    // number: {
    //   range: '${label} must be between ${min} and ${max}',
    // },
  }

  // 点击表单提交按钮触发的方法
  const finish = async (values) => {
    if (activeKey === "user") {
      form
        .validateFields(["username", "password", "rem"])
        .then(async (values) => {
          // 用户名密码登录逻辑
          const { username, password, rem } = values
          // 发送请求，请求登录~
          const token = await login(username, password)
          // 请求失败 拦截器会自动报错
          // 请求成功~
          // rem 代表要不要记住密码
          if (rem) {
            // 持久化存储
            localStorage.setItem("user_token", token)
          }
          // 跳转到主页
          history.replace("/")
        })

      return
    }

    form.validateFields(["mobile", "code", "rem"]).then(async (values) => {
      // 用户名密码登录逻辑
      const { mobile, code, rem } = values
      // 发送请求，请求手机号登录~
      const token = await mobileLogin(mobile, code)
      // 请求失败 拦截器会自动报错
      // 请求成功~
      // rem 代表要不要记住密码
      if (rem) {
        // 持久化存储
        localStorage.setItem("user_token", token)
      }
      // 跳转到主页
      history.replace("/")
    })
  }

  const countingDown = () => {
    // 内部会缓存state结果。导致更新失败
    const timer = setInterval(() => {
      // 更新倒计时
      countingDownTime--
      if (countingDownTime <= 0) {
        // 清除定时器
        clearInterval(timerRef.current)
        countingDownTime = TOTAL_TIME
        setIsSendCode(false)
        return
      }
      // setCountingDownTime目的为了重新渲染组件，数据更新不更新无所谓
      setCountingDownTime(countingDownTime)
    }, 1000)
    // 保存起来
    timerRef.current = timer
  }

  // 点击发送验证码
  const sendCode = () => {
    // 判断用户有没有输入手机号 并且 要合法
    // 手动触发表单校验规则
    form
      .validateFields(["mobile"])
      .then(async ({ mobile }) => {
        // 发送请求，获取验证码~
        await reqSendCode(mobile)
        // 发送成功~
        setIsSendCode(true) // 代表已经发送过验证码
        countingDown()
        message.success("验证码发送成功~")
      })
      .catch((err) => {
        // 页面已经有提示了
      })
  }

  // oauth登录第一步：跳转到github授权地址
  const goGithub = () => {
    /*
      地址 https://github.com/login/oauth/authorize
      参数
        client_id 
      可能要注册成功，要等半天左右时间才能生效
        Client ID ba6e49e04ddda1b425ed
        Client Secret a00d71816a3fdb62af99de658fb9a893426bc95d
      注意：要保证客户端和服务器一致~  
    */
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`
  }

  return (
    <Form
      form={form}
      validateMessages={validateMessages}
      initialValues={{ username: 'admin', password: '111111', rem: true}}
      // 注意button按钮的类型必须submit
      // onFinish={finish} // 问题会校验所有表单。
    >
      <Tabs activeKey={activeKey} onChange={handleTabChange}>
        <TabPane tab="账户密码登录" key="user">
          {/* 
            用户名的校验规则: 
            1. 必填项
            2. 长度大于4个字符
            3. 长度不能超过16个字符
            4. 只能是字母,数字,下划线

            表单校验的触发时机: 输入内容的时候会触发,
            点击表单的提交按钮,提交前也会触发
          
          */}
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: '必须输入用户名'
              },
              {
                min: 4,
                message: '用户名至少四个字符'
              },
              {
                max: 16,
                message: '用户名不能超过十六个字符'
              },
              {
                pattern: /^[0-9a-zA-Z_]+$/,
                message: '只能输入数字字母下划线'
              }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名: admin" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ validator }]}
          >
            <Input
              type="password"
              prefix={<LockOutlined />}
              placeholder="密码: 111111"
            />
          </Form.Item>
        </TabPane>
        <TabPane tab="手机号登录" key="mobile">
          <Form.Item
            name="mobile"
            // 表单校验规则
            rules={[
              { required: true, message: "请输入手机号" },
              {
                pattern: /^(((13[0-9])|(14[579])|(15([0-3]|[5-9]))|(16[6])|(17[0135678])|(18[0-9])|(19[89]))\d{8})$/,
                message: "请输入正确的手机号",
              },
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="手机号" />
          </Form.Item>

          <Row justify="space-between">
            <Col>
              <Form.Item
                name="code"
                // 表单校验规则
                rules={[
                  {
                    required: true,
                    message: "请输入验证码",
                  },
                  {
                    pattern: /^[0-9]{6}$/,
                    message: "请输入正确的验证码",
                  },
                ]}
              >
                <Input placeholder="验证码" />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button onClick={sendCode} disabled={isSendCode}>
                  {isSendCode
                    ? `${countingDownTime}秒后可重发`
                    : "点击发送验证码"}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
      {/* 默认接管组件value属性，但是现在需要修改的checked  */}
      <Row justify="space-between">
        <Col>
          <Form.Item name="rem" valuePropName="checked">
            <Checkbox>记住密码</Checkbox>
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button type="link">忘记密码</Button>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Button type="primary" onClick={finish} className="login-form-btn">
          登录
        </Button>
      </Form.Item>
      <Row justify="space-between">
        <Col>
          <Form.Item>
            <div className="login-form-icons">
              <span>其他登录方式</span>
              <GithubOutlined className="icons" onClick={goGithub} />
              <WechatOutlined className="icons" />
              <QqOutlined className="icons" />
            </div>
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button type="link">注册</Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default withRouter(connect(null, { login, mobileLogin })(LoginForm))
