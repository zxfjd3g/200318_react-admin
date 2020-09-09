import React from 'react'
import {
  Card,
  PageHeader,
  Form,
  Input,
  Switch,
  Button,
  message
} from 'antd'

import {reqAddLesson} from '@/api/edu/lesson'

import Upload from '@/components/Upload'

export default function AddLesson({
  history,
  location
}) {

  const [form] = Form.useForm()
  // 取出跳转路由携带的章节对象
  const chapter = location.state


  const onFinish = async (values) => {
    await reqAddLesson({ ...values, chapterId: chapter._id })
    message.success('添加课时成功')
    form.resetFields()
    history.replace('/edu/chapter/list')
  }

  const title = (
    <PageHeader 
      onBack={() => history.replace('/edu/chapter/list')}
      title="添加课时"
    />
  )

  const layout = {
    labelCol: {span: 3},
    wrapperCol: {span: 8}  
  }

  return (
    <Card title={title}>
      <Form 
        form={form} 
        onFinish={onFinish}
        {...layout}
        initialValues={{
          free: true
        }}
      >
        <Form.Item label="章节名称">
          {chapter.title}
        </Form.Item>
        <Form.Item 
          label="课时名称"
          name="title"
          rules={[
            {required: true, message: '必须指定课时名称'}
          ]}
        >
          <Input placeholder="课时名称"/>
        </Form.Item>

        {/* 
        Item默认是操作的表单项的value属性, 
        但Switch的状态是存在checked属性上 
        可能通过valuePropName来指定操作表单项哪个属性
        */}
        <Form.Item 
          label="是否免费"
          name="free"
          rules={[
            {required: true}
          ]}
          
          valuePropName="checked"
        > 
          <Switch checkedChildren="是" unCheckedChildren="否"/>
        </Form.Item>
        <Form.Item 
          label="视频"
          name="video"
          rules={[
            {required: true, message: '必须上传视图'}
          ]}
        >
          {/* Item会给内部组件传入一个onChange函数, 用来指定新的数据值 */}
          <Upload/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">添加</Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
