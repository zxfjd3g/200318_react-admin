/* 
搜索的组件
*/
import React, {useState} from 'react'
import {
  Card,
  Table,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
  message
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
import {reqAddChapter} from '@/api/edu/chapter'

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
  const [isShowAdd, setIsShowAdd] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm()

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
      <Button 
        type="primary" 
        icon={<PlusOutlined/>} 
        disabled={!courseId}
        onClick={() => setIsShowAdd(true)}
      >
        新增章节
      </Button>
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

  /* 
  添加章节
  */
  const addChapter = async () => {
    // 表单校验
    const {title} = await form.validateFields()
    // 校验成功, 发送添加章节的请求

    /* 
    添加成功后, 更新前台界面
      方式1: 直接在前台把数据更新一下
        好处: 不用再发请求
        不好: 其它所有数据都不是最新的
      方式2: 再次发送获取列表请求  ===> 绝大部分都用这种
        好处: 数据全部都是最新的
        不好: 请求需要一定的时间
    */
    await reqAddChapter(courseId, title)
    message.success('添加章节成功')
    form.resetFields()
    setIsShowAdd(false)
    getChapters(1)
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

    <Modal
      confirmLoading={confirmLoading}
      visible={isShowAdd}
      title="添加章节"
      onCancel={() => {
        form.resetFields()
        setIsShowAdd(false)
      }}
      onOk={addChapter}
    >
      <Form
        form={form}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 14,
        }}
        layout="horizontal"
      >
        <Form.Item
          name="title"
          label="章节名称"
          rules={[
            {
              required: true,
              message: '必须输入章节名称',
            },
          ]}
        >
          <Input placeholder="章节名称"/>
        </Form.Item>
      </Form>
    </Modal>

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
