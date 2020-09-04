import React, { Component } from 'react'
import {Card, Button, Table, Tooltip} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,

} from '@ant-design/icons' // 实现对内置图标的按需引入打包
import {reqSubjectList} from '@/api/edu/subject'

import './index.less'

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
    },
    loading: false, // 是否正在加载中
  }

  componentDidMount () {
    // 获取第一页显示
    this.getSubjectList()
  }

  getSubjectList = async (page=this.state.page, pageSize=this.state.pageSize) => {

    // 显示Loading
    this.setState({
      loading: true
    })

    // 发ajax请求获取分页列表数据
    const subjectList = await reqSubjectList(page, pageSize)

    // 更新状态
    this.setState({
      loading: false,
      subjectList,  
      page,
      pageSize
    })
  }

  render() {

    // 取出数据
    const {subjectList: {total, items}, page, pageSize, loading} = this.state

    // card左上角标题
    const title = <Button type="primary" icon={<PlusOutlined/>}>添加新分类</Button>

    const columns = [
      {
        title: '分类名称',
        dataIndex: 'title',
        key: 'title',
      },
      {
        width: '30%',
        title: '操作',
        key: 'action',
        // dataIndex: 'age',
        render: () => (
          <>
            <Tooltip placement="top" title='修改分类'>
              <Button type="primary" icon={<EditOutlined/>} className="subject-btn-edit"></Button>
            </Tooltip>
            <Tooltip placement="top" title='删除分类'>
              <Button type="danger" icon={<EditOutlined/>}></Button>
            </Tooltip>
          </>
        )
      },
    ];
    

    return (
      <Card title={title} className="subject">
        <Table 
          bordered
          loading={loading}
          dataSource={items} 
          columns={columns}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize,
            total,
            pageSizeOptions: [3, 6, 9, 12],
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total, range) => `共${total}条`,
            onChange: this.getSubjectList,
            onShowSizeChange: (current, pageSize) => this.getSubjectList(1, pageSize),
          }}
        />
      </Card>
    )
  }
}
