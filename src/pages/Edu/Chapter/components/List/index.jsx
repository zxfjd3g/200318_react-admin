/* 
搜索的组件
*/
import React from 'react'
import {
  Card,
  Table,
  Button,
  Tooltip
} from 'antd'

import {
  PlusOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons' // 实现对内置图标的按需引入打包

import './index.less'

export default function List (props) {

  const columns = [
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title'
    },

    {
      title: '是否免费',
      dataIndex: 'free',
      key: 'free'
    },

    {
      title: '视频',
      dataIndex: 'video',
      key: 'video'
    },

    {
      title: '操作',
      key: 'action',
      render: (record) => {
        return (
          <>
            <Tooltip placement="top" title='新增课时'>
              <Button type="primary" icon={<PlusOutlined />}></Button>
            </Tooltip>
            <Tooltip placement="top" title='修改课时'>
              <Button type="primary" icon={<EditOutlined />}></Button>
            </Tooltip>
            <Tooltip placement="top" title='删除课时'>
              <Button type="danger" icon={<DeleteOutlined />}></Button>
            </Tooltip>
          </>
        )
      } 
    },

  ]

  // Card的右上角界面
  const extra = (
    <>
      <Button type="primary" icon={<PlusOutlined/>}>新增章节</Button>
      <Tooltip placement="top" title="全屏">
        <FullscreenOutlined className="chapter-list-full"/>
      </Tooltip>
      <Tooltip placement="top" title="刷新">
        <ReloadOutlined/>
      </Tooltip>
    </>
  )

  return (
    <Card title="课程章节列表" extra={extra} className="chapter-list">
      <Table
        bordered
        dataSource={[]}
        columns={columns}
      />
    </Card>
  )
}
