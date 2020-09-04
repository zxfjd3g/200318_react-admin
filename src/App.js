import React from "react"
import { Router } from "react-router-dom"
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'

import history from "@/utils/history"
import Layout from "./layouts"

// 引入重置样式
import "./assets/css/reset.css"

function App() {
  return (
    <Router history={history}>
      <ConfigProvider locale={zhCN}>
        <Layout />
      </ConfigProvider>
    </Router>
  )
}

export default App
