import React, { useState, useEffect } from "react"
import { Form, Input, Select, Cascader, Button, Card } from "antd"
import PubSub from 'pubsub-js'
import { reqAllTeacherList} from "@/api/edu/teacher"
import { reqAllSubjectList, reqAllSubSubjectList } from "@/api/edu/subject"

import "./index.less"

const { Option } = Select

export default function SearchForm() {

  const [form] = Form.useForm()
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const [teachers, subjects] = await Promise.all([
        // 请求所有讲师数据
        reqAllTeacherList(),
        // 请求所有一级分类数据
        reqAllSubjectList(),
      ])
      setTeachers(teachers)
      // subjects数据展示需要处理
      setSubjects(subjects.map((subject) => {
        return {
          value: subject._id, // 选中的值
          label: subject.title, // 显示名称
          isLeaf: false,
        }
      }))
    }

    fetchData()
  }, [])
  
  const loadData = async selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    targetOption.loading = true

    // 加载二级菜单数据
    const { items } = await reqAllSubSubjectList(targetOption.value)

    // 关闭加载
    targetOption.loading = false

    if (items.length>0) {
      // targetOption是一级菜单，children属性显示的是二级菜单数据
      targetOption.children = items.map((item) => {
        return {
          value: item._id,
          label: item.title,
          // isLeaf: false, // 如果加上这个属性，还能请求三级菜单~
        }
      })
    } else {
      // 没有二级菜单~
      targetOption.isLeaf = true
    }

    setSubjects([...subjects])
  }

  const onFinish = async (values) => {
    const {
      title,
      teacherId,
      subjectIds = [], // 默认值
    } = values
    let subjectId, subjectParentId

    if (subjectIds.length === 1) { // 只有一级分类
      subjectParentId = "0"
      subjectId = subjectIds[0]
    } else if (subjectIds.length === 2) { // 选择了二级分类
      subjectParentId = subjectIds[0]
      subjectId = subjectIds[1]
    }

    //发布消息传递：一级分类列表、讲师列表、课程列表
		/* 
			传递课程列表的目的：CourseList要展示课程列表
			传递一级分类、讲师列表的目的：CourseList展示的是讲师id、分类id，要对应成讲师名字、分类名字
		*/
    PubSub.publish('search',{subjects, teachers, searchParams: { title, teacherId, subjectId, subjectParentId }})
  }

  return (
    <Card style={{marginBottom: 20}}>
      <Form form={form} layout="inline" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="标题"
        >
          <Input placeholder="请输入标题" allowClear className="search_title"/>
        </Form.Item>

        <Form.Item
          name="teacherId"
          label="讲师"
        >
          <Select className="teacher_select" placeholder="请选择讲师" allowClear>
            {
              teachers.map((t)=><Option key={t._id} value={t._id}>{t.name}</Option>)
            }
          </Select>
        </Form.Item>

        <Form.Item
          name="subjectIds"
          label="分类"
        >
          <Cascader
            changeOnSelect
            options={subjects}
            loadData={loadData}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">搜索</Button>
          <Button onClick={() => form.resetFields()} className="search_reset">重置</Button>
        </Form.Item>
      </Form>
    </Card>
  )
}


