import React, { useState, useEffect, useRef } from "react"
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

export default function Upload (props) {

  const [uploadToken, setUploadToken] = useState('')
  const [expires, setExpires] = useState(0)
  const [isUploadSuccess, setIsUploadSuccess] = useState(false)
  const subRef = useRef(null)

  // 初始获取上传需要的token
  useEffect(() => {
    getUploadToken()

    return () => {
      subRef.current && subRef.current.unsubscribe()
    }
  }, [])

  /* 
  获取上传需要的token
  */
  const getUploadToken = async () => {
    let token = uploadToken
    let exp = expires
    if (!exp) {
      // 从本地读取数据，并解析成对象
       const data = JSON.parse(localStorage.getItem("upload_token")) || {}
       // 取出其中的token值和失效时间
       token = data.uploadToken
       exp = data.expires
    }
    
    // 如果在有效期内
    if (exp < Date.now()) {
      // 如果原本状态没有值, 保存token和expires
      if (!expires) {
        setUploadToken(token)
        setExpires(expires)
      }
    } else {
      // 如果有数据, 清除数据(数据已过期)
      if (exp) {
        setUploadToken('')
        setExpires('')
        localStorage.removeItem('upload_token')
      }
      // 请求获取token和expires数据
      const data = await reqUploadToken()
      // 将过期时间修正为时间数值, 并提前一点
      data.expires = Date.now() + expires * 1000 - 5 * 60 * 1000
      // 保存数据到state和local中
      setUploadToken(data.uploadToken)
      setExpires(data.expires)
      localStorage.setItem("upload_token", JSON.stringify(data))
    }
  }

  /* 
  在提交上传请求前调用
  可以返回布尔值或promise, 用于告知是否需要发请求
  promise的方式用于检查中包含异步操作
  如果是promise, 不发请求, 调用reject(), 如果是需要发请求, 调用resolve(file)
  */
  const beforeUpload = (file, fileList) => {
    return new Promise((resolve, reject) => {
      // 如果文件超过了大小, 不提交请求
      if (file.size > MAX_VIDEO_SIZE) {
        message.warn('上传视频不能超过35mb')
        reject()
        return
      }

      // 获取到有效的token后, 才允许提交上传请求
      getUploadToken().then(() => resolve(file))
    })
  }

  /* 
  自定义上传视频方案
  */
  const customRequest = ({file, onProgress, onSuccess, onError}) => {

    const key = nanoid(10) // 唯一标识
    const putExtra = {
      mimeType: ['video/*'] // 指定文件类型
    }
    const config = {
      region: qiniu.region.z2 // 代表华南地区
    }

    // 创建上传文件对象
    const observable = qiniu.upload(
      file, // 要上传的文件
      key, // 上传文件的名称(唯一)
      uploadToken, // 身份标识token
      putExtra, // 指定接收文件类型的配置
      config // 指定服务器地区的配置
    )

    // 创建上传的观察对象
    const observer = {
      next(res){ // 显示进度
        console.log('next()', JSON.stringify(res))
        const percent = res.total.percent
        onProgress({percent})
      },
      error(err){ 
        console.log('error()', err)
        // 指定上传错误
        onError(err)
        message.error('上传视频失败')
      },
      complete(res){ 
        console.log('complete', res)
        // 指定上传成功
        onSuccess(res)
        message.success("上传视频成功")
        // 根据返回的视频key值, 确定视频的url
        const video = qiniuConfig.prefix_url + res.key
        // 保存到表单项数据中
        props.onChange(video)
        // 保存上传成功的标识值
        setIsUploadSuccess(true)
      }
    }

    // 开始上传
    const subscription = observable.subscribe(observer) // 上传开始

    // 保存用于取消订阅的对象
    subRef.current = subscription
  }

  /* 
  删除视频
  */
  const onRemove = () => {
    // 上传取消
    subRef.current && subRef.current.unsubscribe()
    // 让表单保存video为''
    props.onChange("")
    // 标识没有上传成功的视频
    setIsUploadSuccess(false)
  }

  return (
    <AntdUpload
      accept="video/*"
      listType="picture"
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onRemove={onRemove}
    >
      {
        !isUploadSuccess && (
          <Button icon={<UploadOutlined/>} disabled={!uploadToken}>上传视频</Button>
        )
      }
    </AntdUpload>
  )
}
