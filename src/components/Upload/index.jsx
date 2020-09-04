import React, { Component } from "react"
import {
  Button,
  Upload as AntdUpload,
  message,
} from "antd"
import { UploadOutlined } from "@ant-design/icons"
import * as qiniu from "qiniu-js" // 七牛上传SDK
import { nanoid } from "nanoid" // 用来生成唯一id

import { reqUploadToken } from "@/api/edu/upload"

import qiniuConfig from "@/config/qiniu"

const MAX_VIDEO_SIZE = 35 * 1024 * 1024 // 35mb

/*
  上传七牛云 SDK 文档: https://developer.qiniu.com/kodo/sdk/1283/javascript
  上传凭证：https://developer.qiniu.com/kodo/manual/1208/upload-token
*/
export default class Upload extends Component {

  // 从本地读取UploadToken
  getUploadToken = () => {
    try {
      // 从本地读取数据，并解析成对象
      const { uploadToken, expires } = JSON.parse(localStorage.getItem("upload_token"))

      // 判断本地token是否过期
      if (!this.isValidUploadToken(expires)) {
        throw new Error("uploadToken过期了~")
      }

      return {
        uploadToken,
        expires,
      }
    } catch {
      localStorage.removeItem('upload_token')
      
      // JSON解析失败
      return {
        uploadToken: "",
        expires: 0,
      }
    }
  }
  
  // 初始化状态
  state = {
    ...this.getUploadToken(),
    isUploadSuccess: false,
  }

  fetchUploadToken = async () => {
    const { uploadToken, expires } = await reqUploadToken()
    const data = {
      uploadToken,
      // 设置过期时间：当前时间 + 7200 * 1000 - 5 * 60 * 1000
      // 提前 5分钟 刷新
      expires: Date.now() + expires * 1000 - 5 * 60 * 1000,
    }
    // 更新状态
    this.setState(data)
    // 持久化储存
    localStorage.setItem("upload_token", JSON.stringify(data))
  }

  // 判断UploadToken是否有效
  // 返回值 true 有效
  // 返回值 false 无效
  isValidUploadToken = (expires) => {
    return expires > Date.now()
  }
  
  /**
   * 上传之前触发的函数
   * @param {*} file 当前上传的文件
   * @param {*} fileList 上传的文件列表（包含之前上传和当前上传~）
   * @return {Boolean|Promise} 返回值false/reject就终止上传，其他情况就继续上传
   */
  beforeUpload = (file, fileList) => {
    /*
      在上传视频之前要做什么事？
        1. 限制上传视频文件大小~
    */
    return new Promise(async (resolve, reject) => {
      // console.log(file, fileList)
      if (file.size > MAX_VIDEO_SIZE) {
        message.warn("上传视频不能超过35mb")
        return reject() // 终止上传
      }
      /*
        上传之前：
          检查凭证有无过期
          没有过期，就直接使用
          过期了，就重新发送请求读取使用，既要存在state，也要存在localStorage中
      */
      const { expires } = this.state

      if (!this.isValidUploadToken(expires)) {
        // 过期了，重新请求
        await this.fetchUploadToken()
      }
      // 文件大小OK
      resolve(file) // file就会作为要上传的文件，进行上传~
    })
  }

  /* 
  自定义上传视频方案
  */
  customRequest = ({ file, onProgress, onSuccess, onError }) => {
    const { uploadToken } = this.state
    // console.log(uploadToken)
    const key = nanoid(10) // 生成长度为10随机id，并且一定会保证id是唯一的
    const putExtra = {
      fname: "", // 文件原名称
      // params: {}, // 用来放置自定义变量
      mimeType: ["video/mp4"], // 用来限定上传文件类型
    }
    const config = {
      // 当前对象存储库位于区域（华东 华南 华北...）
      // qiniu.region.z0: 代表华东区域
      // qiniu.region.z1: 代表华北区域
      // qiniu.region.z2: 代表华南区域
      // qiniu.region.na0: 代表北美区域
      // qiniu.region.as0: 代表东南亚区域
      region: qiniuConfig.region,
    }
    // 1. 创建上传文件对象
    const observable = qiniu.upload(
      file, // 上传的文件
      key, // 上传的文件新命名（保证唯一性）
      uploadToken, // 上传凭证
      putExtra,
      config
    )
    // 2. 创建上传过程触发回调函数对象
    const observer = {
      next(res) {
        // 上传过程中触发的回调函数
        // 上传总进度
        const percent = res.total.percent.toFixed(2)
        // 更新上次进度
        onProgress({ percent }, file)
        /*
          // 大于 4M 时可分块上传，小于 4M 时直传
          // 代表每一个块上传的进度
          chunks: { 
            0: {loaded: 1130496, size: 4194304, percent: 26.953125}
            1: {loaded: 311296, size: 4194304, percent: 7.421875}
            2: {loaded: 589824, size: 4194304, percent: 14.0625}
            3: {loaded: 0, size: 4194304, percent: 0}
            4: {loaded: 0, size: 4194304, percent: 0}
            5: {loaded: 0, size: 2664146, percent: 0}
          },
          total: {
            // 总进度
            percent: 26.953125
          }
        */
      },
      error(err) {
        // 上传失败触发的回调函数
        onError(err)
        message.error("上传视频失败~")
      },
      complete: (res) => {
        // 上传成功（全部数据上传完毕）触发的回调函数
        onSuccess(res)
        message.success("上传视频成功~")
        // console.log(res) // {hash: "FtaFsLF3Z_j_-q209fBTqb7pQheN", key: "mHhiHjtY3h"}
        const video = qiniuConfig.prefix_url + res.key
        // onChange是Form.Item传入的，当你调用传入值时。这个值就会被Form收集
        this.props.onChange(video)
        // 隐藏按钮
        this.setState({
          isUploadSuccess: true,
        })
      },
    }
    // 3. 开始上传
    this.subscription = observable.subscribe(observer)
  }

  componentWillUnmount() {
    // 上传取消
    // 如果没有上传过 this.subscription时undefined，此时不需要取消上传~
    this.subscription && this.subscription.unsubscribe()
  }

  /* 
  删除视频
  */
  remove = () => {
    // 上传取消
    this.subscription && this.subscription.unsubscribe()

    this.props.onChange("")
    // 显示按钮
    this.setState({
      isUploadSuccess: false,
    })
  }

  render() {
    const { isUploadSuccess } = this.state
    return (
      <AntdUpload
        accept="video/*" // 决定上传选择的文件类型
        listType="picture"
        beforeUpload={this.beforeUpload}
        customRequest={this.customRequest}
        onRemove={this.remove}
      >
        {isUploadSuccess ? null : (
          <Button>
            <UploadOutlined /> 上传视频
          </Button>
        )}
      </AntdUpload>
    )
  }
}
