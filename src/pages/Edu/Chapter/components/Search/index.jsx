/* 
搜索的组件
*/
import React, {useEffect} from 'react'
import {
  Card,
  Form,
  Select,
  Button
} from 'antd'
import {connect} from 'react-redux'

import { getAllCourseList } from '../../redux'

const {Option} = Select

import './index.less'

function Search ({ // 解构props
  allCourseList,
  getAllCourseList
}) {
  const [form] = Form.useForm()

  // 初始请求获取所有课程列表
  useEffect(() => {
    getAllCourseList()
  }, [])


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
            {
              allCourseList.map(c => (
                <Option value={c._id} key={c._id}>{c.title}</Option>
              ))
            }
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

export default connect(
  state => ({
    allCourseList: state.chapter.allCourseList
  }),  // 指定一般属性
  {
    getAllCourseList
  }  // 指定函数属性, 直接放入action
)(Search)
