/* 
搜索的组件
*/
import React, {useEffect} from 'react'
import {
  Card,
  Form,
  Select,
  Button,
  message
} from 'antd'
import {connect} from 'react-redux'

import { getAllCourseList, getChapterList } from '../../redux'

const {Option} = Select

import './index.less'

function Search ({ // 解构props
  allCourseList,
  pageSize,
  courseId,

  getAllCourseList,
  getChapterList
}) {
  const [form] = Form.useForm()

  // 初始请求获取所有课程列表
  useEffect(() => {
    getAllCourseList()
  }, [])


  /* 
  表单校验成功后调用
  */
  const onFinish = async ({courseId}) => {
    // 分发获取章节分页列表的异步action
    const chapterList = await getChapterList({ page: 1, pageSize, courseId })  
    // dispatch(异步action)返回的是一个promise对象, 其结果由异步action返回的promise来决定
    /* function getChapterList(...args) {
      return dispatch(getChapterList(...args))
    } */
    console.log('chapterList', chapterList)
    message.success('搜索章节列表成功')
  }

  return (
    <Card className="chapter-search">
      <Form 
        form={form} 
        layout="inline" 
        onFinish={onFinish}
        initialValues={{
          courseId: courseId ? courseId : undefined
        }}
      >
        <Form.Item
          label="选择课程"
          name="courseId"
          rules={[{ required: true, message: '请选择课程!' }]}
        >
          <Select placeholder="请输入" allowClear className="chapter-search-select"
            getPopupContainer={triggerNode => triggerNode.parentNode}>
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
            <Button onClick={() => {
              form.setFieldsValue({courseId: undefined})
              // form.resetFields()
            }}>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default connect(
  state => ({
    allCourseList: state.chapter.allCourseList,
    pageSize: state.chapter.pageSize,
    courseId: state.chapter.courseId
  }),  // 指定一般属性
  {
    getAllCourseList,
    getChapterList
  }  // 指定函数属性, 直接放入action
)(Search)


// 高阶组件用来封装可复用的功能
  // connect: 向指定UI组件传入指定的属性
  // withRouter: 向非路由组件传入history/match/location属性