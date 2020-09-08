import React, { Component } from 'react'
import {Card, Button, Table, Tooltip} from 'antd'
import PubSub from 'pubsub-js'
import dayjs from 'dayjs'

import {
	PlusOutlined,
	UploadOutlined,
	FormOutlined,
	DeleteOutlined
} from '@ant-design/icons'

import {
  reqCourseList
} from '@/api/edu/course'
import './index.less'

export default class List extends Component {

  state = {
    page: 1,
    limit: 2,
    courses: [],
    total: 0
  }

  searchParams = {}
  subjects = []
  teachers = []

  columns = [
    {
      title: "序号",
      key: "index",
      align:'center',
      width:100,
      render: (text, record, index) => index + 1
    },
    {
      title: "课程标题",
      key: "title",
      dataIndex: "title",
      align:'center',
      width:170,
    },
    {
      title: "课程描述",
      key: "description",
      dataIndex: "description",
      align:'center',
      width:200,
    },
    {
      title: "课程图片",
      key: "cover",
      dataIndex: "cover",
      align:'center',
      width:140,
      render:(cover)=><img src={cover} className="course_img" alt=""/>
    },
    {
      title: "课程价格",
      key: "price",
      dataIndex: "price",
      align:'center',
      width:120,
      render:(price)=>'￥'+price
    },
    {
      title: "课程讲师",
      key: "teacherId",
      dataIndex: "teacherId",
      align:'center',
      width:200,
      render:(teacherId)=>{
        const result = this.teachers.find((t)=>{
          return t._id === teacherId
        })
        return result.name
      }
    },
    {
      title: "所属课程分类",
      key: "subjectParentId",
      dataIndex: "subjectParentId",
      align:'center',
      width:200,
      render:(id)=>{
        console.log(this.subjects, id)
        const result = this.subjects.find(s=> s.value === id)
        return result.label
      }
    },
    {
      title: "总课时",
      key: "lessonNum",
      dataIndex: "lessonNum",
      align:'center',
      width:100,
    },
    {
      title: "总阅读量",
      key: "viewCount",
      dataIndex: "viewCount",
      align:'center',
      width:100,
    },
    {
      title: "总购买量",
      key: "buyCount",
      dataIndex: "buyCount",
      align:'center',
      width:100,
    },
    {
      title: "最新修改时间",
      key: "gmtModified",
      dataIndex: "gmtModified",
      align:'center',
      width:200,
      render:time =>dayjs(time).format('YYYY年MM月DD日 HH:mm:ss')
    },
    {
      title: "课程状态",
      key: "status",
      dataIndex: "status",
      render: (status)=> status==1 ? '已发布' : '未发布',
      align:'center',
      width:200,
    },
    {
      title: "版本号",
      key: "version",
      dataIndex: "version",
      align:'center',
      width:200,
      key:"version"
    },
    {
      title: "操作",
      key: "action",
      align:'center',
      width:200,
      fixed:'right',
      render:()=>(
        <>
          <Tooltip placement="top" title="发布课程">
            <Button 
                type="primary" 
                className="edit_btn" 
                icon={<UploadOutlined />}
            >
            </Button>
          </Tooltip>
          <Tooltip placement="top" title="编辑课程">
            <Button 
                type="primary" 
                className="edit_btn" 
                icon={<FormOutlined />}
            >
            </Button>
          </Tooltip>
          <Tooltip placement="top" title="删除课程">
            <Button 
              type="danger" 
              icon={<DeleteOutlined />}
            ></Button>
          </Tooltip>
        </>
      )
    },
  ]

  getCourses = async (page = this.state.page, limit = this.state.limit) => {
    this.setState({
      page,
      limit
    })
    const {searchParams} = this
    const {items, total} = await reqCourseList({ page, limit, ...searchParams })
    this.setState({
      courses: items,
      total
    })
    // message.success("查询课程分类数据成功~")
  }

  componentDidMount () {
    PubSub.subscribe('search', (msg, {subjects, teachers, searchParams}) => {
      this.subjects = subjects
      this.teachers = teachers
      this.searchParams = searchParams

      // 发送请求查询第一页
      this.getCourses(1)
    }) 
  }

  render() {

    const {page, limit, courses, total} = this.state

    return (
      <Card 
				title="课程列表"
				extra={
					<Button type="primary" icon={<PlusOutlined />}>新增课程</Button>
				}
			> 
				<Table
					rowKey="_id" //唯一标识
					columns={this.columns} //表格中列的配置
					dataSource={courses}//表格的数据源(存储数据的数组)
          scroll={{x:1}}
          onChange={this.handleChange}
          pagination={{
            current: page,
            pageSize: limit,
            pageSizeOptions: ["2", "4", "6", "8"],
            showQuickJumper: true,
            showSizeChanger: true,
            total: total,
            onChange: this.getCourses,
            onShowSizeChange: (page, pageSize) => this.getCourses(1, pageSize),
          }}
				/>
			</Card>
    )
  }
}