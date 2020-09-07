/* 
搜索的组件
*/
import React from 'react'
import {
  Card,
  Form,
  Select,
  Button
} from 'antd'

const {Option} = Select

import './index.less'

export default function Search (props) {
  const [form] = Form.useForm()

  /* 
  表单校验成功后调用
  */
  const onFinish = (values) => {

  }

  return (
    <Card className="chapter-search">
      <Form 
        form={form} 
        layout="inline" 
        onFinish={onFinish}
      >
        <Form.Item
          label="选择课程"
          name="courseId"
          rules={[{ required: true, message: '请选择课程!' }]}
        >
          <Select placeholder="请输入" allowClear className="chapter-search-select">
            <Option value="1">AAA</Option>
            <Option value="2">BBB</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
           <Button
              type="primary"
              htmlType="submit"
              className="chapter-search-btn"
            >
              搜索
            </Button>
            <Button>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
