import React, { Component } from 'react'
import {reqSubjectList} from '@/api/edu/subject'

/* 
分类管理的路由组件
*/
export default class Subject extends Component {

  state = {
    page: 1, // 当前页码
    pageSize: 3, // 每页数量
    subjectList: {
      items: [], // 当前页的数组
      total: 0,  // 总数量
    }
  }

  componentDidMount () {
    // 获取第一页显示
    this.getSubjectList()
  }

  getSubjectList = async (page=this.state.page, pageSize=this.state.pageSize) => {

    // 发ajax请求获取分页列表数据
    const subjectList = await reqSubjectList(page, pageSize)

    // 更新状态
    this.setState({
      subjectList,
      page,
      pageSize
    })
  }

  render() {
    return (
      <div>
        Subject
      </div>
    )
  }
}
