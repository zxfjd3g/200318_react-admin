/* 
搜索的组件
*/
import React, {useState} from 'react'
import {
  Card,
  Table,
  Button,
  Tooltip
} from 'antd'
import {connect} from 'react-redux'
import {
  PlusOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons' // 实现对内置图标的按需引入打包

import {getChapterList, getLessonList} from '../../redux'
import {DEFAULT_PAGE_SIZE} from '@/config/constants'

import './index.less'

function List ({
  page,
  pageSize,
  chapterList: {total, items},
  courseId,

  getChapterList,
  getLessonList
}) {

  // const [page, setPage] = useState(1)  // 将page交给redux管理
  const [loading, setLoading] = useState(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState([])

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
              <Button type="primary" icon={<EditOutlined />} className="chapter-list-update"></Button>
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

  const getChapters = async (p=page, ps=pageSize) => {
    setLoading(true)
    await getChapterList({page: p, pageSize: ps, courseId})
    setExpandedRowKeys([])
    setLoading(false)
  }

  /* 
  点击展开图标时触发
  */
  const onExpand = (expanded, record) => {
    if (expanded) {
      getLessonList(record._id)
    }
  }

  /* 
  行展开发生变化时触发
  */
  const onExpandedRowsChange = (expandedRowKeys) => {
    setExpandedRowKeys(expandedRowKeys)
  }

  return (
    <Card title="课程章节列表" extra={extra} className="chapter-list">
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
          pageSizeOptions: [
            DEFAULT_PAGE_SIZE, 
            DEFAULT_PAGE_SIZE * 2, 
            DEFAULT_PAGE_SIZE * 3, 
            DEFAULT_PAGE_SIZE * 4
          ],
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => `共${total}条`,
          onChange: getChapters,
          onShowSizeChange: (current, pageSize) => getChapters(1, pageSize),
        }}

        expandable={{
          expandedRowKeys,	// 展开的行，控制属性
          onExpand,	//点击展开图标时触发	function(expanded, record)
          onExpandedRowsChange, // 行展开变化时触发
        }}
      />
    </Card>
  )
}

export default connect(
  state => ({
    page: state.chapter.page,
    pageSize: state.chapter.pageSize,
    chapterList: state.chapter.chapterList,
    courseId: state.chapter.courseId,
  }),
  {
    getChapterList,
    getLessonList
  }
)(List)
