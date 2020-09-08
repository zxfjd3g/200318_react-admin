/* 
搜索的组件
*/
import React, {useState, useRef, useEffect} from 'react'
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
import {withRouter} from 'react-router-dom'
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
  history,

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
  const chapterRef = useRef()

  useEffect(() => { 
    // 解决bug: 提示没有将form传递给<Form>
    // 原因: 第一次使用form不能在form界面显示之前(Form组件对象还没有创建), 必须在显示界面之后
    // 当前已经显示修改章节的form了

    /* 
    当第一次显示Modal时, 创建Modal组件对象, 它内部的组件Form对象是后面再异步创建
    当Modal显示时我们想得到/操作form对象, 
    */

    if (isShowAdd && chapterRef.current) {
      // 第一次显示时会报错, 原因: Form组件对象还没有创建
      // 解决: 在setTimeout中去操作form
      /* form.setFieldsValue({
        title: chapterRef.current.title
      }) */
      setTimeout(() => {
          form.setFieldsValue({
          title: chapterRef.current.title
        })
      });
    }
  }, [isShowAdd])

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
        if (record.video) {
          return (
            <>
              <Button type="primary" icon={<PlusOutlined />} disabled></Button>
              <Tooltip placement="top" title='修改课时'>
                <Button type="primary" icon={<EditOutlined />} className="chapter-list-update"></Button>
              </Tooltip>
              <Tooltip placement="top" title='删除课时'>
                <Button type="danger" icon={<DeleteOutlined />}></Button>
              </Tooltip>
            </>
          ) 
        }

        return (
          <>
            <Tooltip placement="top" title='新增课时'>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => history.push('/edu/chapter/addlesson', record)}></Button>
            </Tooltip>
            <Tooltip placement="top" title='修改章节'>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                className="chapter-list-update"
                onClick={() => {
                  chapterRef.current = {...record}
                  setIsShowAdd(true)
                  // 指定初始显示表单内容
                  // 注意: 不能通过initialValues来指定
                  // form.setFieldsValue({
                  //   title: record.title
                  // })
                }}
              />
            </Tooltip>
            <Tooltip placement="top" title='删除章节'>
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
    setConfirmLoading(true)
    try {
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
    } finally {
      setConfirmLoading(false)
    }
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
      /* getContainer={false} */
      confirmLoading={confirmLoading}
      visible={isShowAdd}
      title={chapterRef.current ? '修改章节' : '添加章节'}
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
        // initialValues={{ // 初始值只会显示第一次显示指定的值
        //   title: chapterRef.current && chapterRef.current.title
        // }}
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

export default withRouter(connect(
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
)(List)) // 容器组件会将接收的路由相关属性透传给UI组件

/* 
withRouter(connect(...)(MyComponent))
// This does not
connect(...)(withRouter(MyComponent))
*/
