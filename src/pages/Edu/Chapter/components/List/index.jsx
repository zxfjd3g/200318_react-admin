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
  FullscreenExitOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons' // 实现对内置图标的按需引入打包
import Player from 'griffith'
import screenfull from 'screenfull'

import {getChapterList, getLessonList} from '../../redux'
import {DEFAULT_PAGE_SIZE} from '@/config/constants'
import {reqAddChapter, reqUpdateChapter, reqRemoveChapter} from '@/api/edu/chapter'
import {reqRemoveLesson} from '@/api/edu/lesson'

import './index.less'

function List ({
  containerRef,
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
  const [isShowVideoModal, setIsShowVideoModal] = useState(false)
  const [lesson, setLesson] = useState({})
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [form] = Form.useForm()
  const chapterRef = useRef()

  /* useEffect(() => { 
    if (isShowAdd && chapterRef.current) {
      setTimeout(() => {
        form.setFieldsValue({
          title: chapterRef.current.title
        })
      })
    }
  }, [isShowAdd]) */

  useEffect(() => {
    // 绑定全屏改变的监听
    screenfull.onchange(() => {
      console.log('---', screenfull.isFullscreen)
      // 保存当前全屏的状态
      setIsFullScreen(screenfull.isFullscreen)
    })
    return () => {
      screenfull.off('change')
    }
  }, [])

  const columns = [
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title'
    },

    {
      title: '是否免费',
      dataIndex: 'free',
      key: 'free',
      render: (free) => free===undefined ? '' : free ? '是' : '否'
    },

    {
      title: '视频',
      dataIndex: 'video',
      key: 'video',
      render: (video, record) => {
        return (
          <Tooltip placement="top" title='预览视频'>
            <Button icon={<EyeOutlined />} onClick={() => {
              setLesson(record)
              setIsShowVideoModal(true)
            }}></Button>
          </Tooltip>
        )
      }
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
                <Button type="danger" icon={<DeleteOutlined />} onClick={() => removeChapterOrLesson(record)}></Button>
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
                  form.setFieldsValue({
                    title: record.title
                  })
                }}
              />
            </Tooltip>
            <Tooltip placement="top" title='删除章节'>
              <Button type="danger" icon={<DeleteOutlined />} onClick={() => removeChapterOrLesson(record)}></Button>
            </Tooltip>
          </>
        )
      } 
    },

  ]

  /* 
  点击进行全屏切换
  */
  function clickScreen () {
    // 得到全局的dom元素
    const container = containerRef.current
    screenfull.toggle(container)
  }

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
        {
          isFullScreen ? <FullscreenExitOutlined className="chapter-list-full" onClick={clickScreen}/>
          : <FullscreenOutlined className="chapter-list-full" onClick={clickScreen}/>
        }
        
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
  const addOrUpdateChapter = async () => {
    // 表单校验
    const {title} = await form.validateFields()
    const chapter = chapterRef.current
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
      if (!chapter) {
        await reqAddChapter(courseId, title)
        message.success('添加章节成功')
      } else {
        await reqUpdateChapter(chapter._id, title)
        message.success('更新章节成功')
        chapterRef.current = null
      }
      
      form.resetFields()
      setIsShowAdd(false)
      getChapters(chapter ? page : 1)
    } finally {
      setConfirmLoading(false)
    }
  }

  /* 
  删除章节或课时
  */
  const removeChapterOrLesson = (record) => {
    Modal.confirm({
      title: <>确定要删除 {record.title} 吗?</>,
      icon: <ExclamationCircleOutlined />,
      content: '谨慎操作, 不可恢复!',
      onOk: async () => {
        if (record.video) {
          await reqRemoveLesson(record._id)
          message.success('删除课时成功!')
          getLessonList(record.chapterId)
        } else {
          await reqRemoveChapter(record._id)
          message.success('删除章节成功!')
          getChapters(page>1 && items.length===1 ? page-1 : page)
        }
      },
      onCancel() {
        console.log('Cancel')
      },
    })
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
      getContainer={false}
      confirmLoading={confirmLoading}
      visible={isShowAdd}
      title={chapterRef.current ? '修改章节' : '添加章节'}
      onCancel={() => {
        chapterRef.current = null
        form.resetFields()
        setIsShowAdd(false)
      }}
      onOk={addOrUpdateChapter}
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

    <Modal
      visible={isShowVideoModal}
      title={lesson.title}
      centered
      destroyOnClose
      footer={null}
      onCancel={() => {
        setIsShowVideoModal(false)
        setLesson({})
      }}
    >
        <Player
          id="video" 
          title={lesson.title}
          cover='/logo512.png'
          duration={2}
          sources={{
            hd: {
              bitrate: 2,
              play_url: lesson.video||'',
              duration: 1000,
              format: 'mp4',
              height: 100,
              width: 100,
              size: 100
            }
          }} />
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
