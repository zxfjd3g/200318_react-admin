import React, {useState, useEffect, useRef} from 'react'

import {
  Upload as AntdUpload,
  Button,
  message
} from 'antd'

import { UploadOutlined } from "@ant-design/icons"

import * as qiniu from 'qiniu-js'
import { nanoid } from 'nanoid' // 用于生成随机唯一值

import { reqUploadToken } from "@/api/edu/upload"

const MAX_VIDEO_SIZE = 1024 * 1024 * 2.5 // 视频的最大大小 2.5M

export default function Upload (props) {

  const [uploadToken, setUploadToken] = useState('')
  const [expires, setExpires] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const subRef = useRef()

  // 初始时获取token
  useEffect(() => {
    getUploadToken()

    return () => { // 在组件死亡前调用
      subRef.current && subRef.current.unsubscribe() // 上传取消
    }
  }, [])

  /* 
  获取用于上传图片token
    内存缓存: state
    硬盘缓存: localeStorage
    服务器端: 必须发请求

    有了后, 需要检查是否已过期
  */
  const getUploadToken = async () => {
    let token = uploadToken
    let exp = expires

    // 内存缓存: state 没有
    if (!token) {
      // 从localeStorage中读取
      const data = JSON.parse(localStorage.getItem('upload-token'))  // {uploadToken, expires} / null
      if (data) {
        // 取出数据
        token = data.uploadToken
        exp = data.expires
      }
    }

    if (exp > 0 && exp < Date.now()) { // 有且没有过期
      if (uploadToken==='') { // 当state中没有时, 保存到state中
        setUploadToken(token)
        setExpires(exp)
        return
      }
    }

    // 如果有, 必然过期了, 清除数据
    if (token) {
      setUploadToken('')
      setExpires(0)
      localStorage.removeItem('upload-token')
    }
    
    // 请求获取token
    const data = await reqUploadToken() // {uploadToken, expires=7200}
    // 修正一下expires
    data.expires = Date.now() + data.expires*1000 - 5 * 60 * 1000 // 提前刷新token
    // 保存到state
    setUploadToken(data.uploadToken)
    setExpires(data.expires)
    // 保存local中
    localStorage.setItem('upload-token', JSON.stringify(data))

  }

  /* 
  准备提交上传请求前回调
    1. 如果文件大于1024 * 25, 不上传
    2. 保证得到一个有效的token
  */
  const beforeUpload = (file, fileList) => {
    // 包含异步的请求, 所有必需是返回一个promise
    return new Promise(async (resolve, reject) => {
      // 1. 如果文件大于1024 * 25, 不上传
      if (file.size > MAX_VIDEO_SIZE) {
        message.success('文件不能超过2.5MB')
        reject() // 不发请求
        return
      }

      await getUploadToken()
      // 只有确保有了有效的token, 才开始上传
      resolve(file)
    })
  }

  /* 
  自定义上传
  */
  const customRequest = ({
    file, // 要上传的文件
    onProgress, //指定上传进度的 : (event: { percent: number }): void
    onError, // 指定上传出错 (event: Error, body?: Object): void
    onSuccess, // 指定上传成功  (body: Object): void
  }) => {

    const key = nanoid() // 唯一文件名
    const token = uploadToken // 七牛给我的身份标识

    const putExtra = { // 配置 指定文件类型
      mimeType: "video/*",
    }
    const config = {   //配置 服务器所在地区(华南)
      region: qiniu.region.z2,
    }

    // 1. 创建一个用于上传的对象
    const observable = qiniu.upload(file, key, token, putExtra, config)

    // 2. 创建用于监视上传的对象
    const observer = {
      next(res){
        // 请求过程中多次回调
        console.log('next', res)
        // 得到当前上传的进度
        const percent = res.total.percent
        console.log('----', percent)
        // 显示进度
        onProgress({percent})
      },
      error(err){
        // 请求失败的回调
        console.log('next', err)
        // 通知Upload失败了
        onError(err)
        message.error('上传失败了')
      },
      complete(res){
        // 请求成功的回调
        console.log('complete', res)
        // 通知Upload成功了
        onSuccess(res)
        message.success('上传成功了')
        setIsSuccess(true)

        // 生成一个视频文件url
        const url = 'http://qfvduovyk.hn-bkt.clouddn.com/' + res.key
        // 交给外部Item管理的video
        props.onChange(url)  // onChange是Item传入的更新数据的函数
      }
    }

    // 3. 上传开始
    const subscription = observable.subscribe(observer)
    // 保存到ref容器
    subRef.current = subscription
    
  }

  /* 
  点击删除时触发
  */
  const onRemove = () => {
    // 发送删除图片 (七牛没有提供对应的接口)

    // 标识未上传
    setIsSuccess(false)
    // 重置外部的video
    props.onChange('')
    // 上传取消
    subRef.current && subRef.current.unsubscribe() 
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
        !isSuccess && <Button icon={<UploadOutlined />}>上传视频</Button>
      }
    </AntdUpload>
  )
}

/* 
1. 请求我们的后台接口从七牛云获取身份标识token
  发送请求的时机:
    打开上传界面就发送
  请求得到token后保存到locale和state中

2. 请求七牛云上传文件(携带token)
*/