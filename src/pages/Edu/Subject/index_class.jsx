import React, { Component } from 'react'
import {Card, Button, Table, Tooltip, Modal, Form, Select, Input, message} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons' // 实现对内置图标的按需引入打包
import {
  reqSubjectList, 
  reqAllSubSubjectList, 
  reqAllSubjectList, 
  reqAddSubject,
  reqUpdateSubject,
  reqDeleteSubject
} from '@/api/edu/subject'

const { confirm } = Modal // 一定要在所有import之后
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
    allSubjectList: [], // 所有分类的数组
    loading: false, // 是否正在加载中
    expandedRowKeys: [], // 存储所有要打开的行的key的数组
    isShowAdd: false, // 是否显示添加的对话框
    confirmLoading: false, // 是否显示确定按钮的loading

    subjectId: '', // 要修改分类的id
    subjectTitle: '', // 输入的分类名称
  }

  // 用于保存<Form>的ref容器
  formRef = React.createRef()
  // 用于保存<Input>的ref容器
  inputRef = React.createRef()

  componentDidMount () {
    // 获取第一页显示
    this.getSubjectList()
  }

  getSubjectList = async (page=this.state.page, pageSize=this.state.pageSize) => {

    // 显示Loading
    this.setState({
      expandedRowKeys: [], // 为了再显示当前页时, 默认不自动展开
      loading: true
    })

    // 发ajax请求获取分页列表数据
    const subjectList = await reqSubjectList(page, pageSize)

    // 整理数据: 给每个subject添加一个cheldren属性
    subjectList.items.forEach(subject => subject.children = [])

    // 更新状态
    this.setState({
      loading: false,
      subjectList,  
      page,
      pageSize
    })
  }

  /* 
  展开的行变化时触发
  */
  onExpandedRowsChange  = (expandedRows) => {
    console.log('onExpandedRowsChange()', expandedRows)
    // 更新对应的状态
    this.setState({
      expandedRowKeys: expandedRows
    })
  }

  /* 
  点击展开/关闭图标
  record: 当前行数据(分类对象)
  */
  onExpand = async (expanded, record) => {
    console.log('onExpand', expanded, record)
    // 如果当前是展开
    if (expanded) {
      this.getAllSubSubjectList(record)
    }
  }

  /* 
  获取指定一级分类的所有二级列表显示
  record: 一级分类对象
  */
  getAllSubSubjectList = async (record) => {
    // 请求获取当前分类的子分类列表
    const {items} = await reqAllSubSubjectList(record._id)  // 返回数据的结构{items, total}
    // 指定为当前分类的children
    /* 
    方式一: 直接修改state中的数据, 再setState(原本的外层值)  ==> 错误的, 如果是PureComponent会发现没有变化(内部做的浅比较)
    */
    // record.children = items // 不要直接修改状态数据
    // this.setState({
    //   subjectList: this.state.subjectList
    // })

    /* 
    方式二: 直接修改state中的数据, 再setState(新的外层值)  ==> 可以的, PureComponent会发现有变化(内部做的浅比较)
      不是特别好
    */
    // record.children = items // 不要直接修改状态数据
    // this.setState({
    //   subjectList: {...this.state.subjectList}
    // })

    /* 
    方式三: 完全产生一个新的数据, 再setState指定这个新数据
    */
    const subjectList = this.state.subjectList
    this.setState({
      subjectList: {
        total: subjectList.total,
        items: subjectList.items.map(item => {
          // 当前要修改的item, 需要返回一个新的item, 其它的直接返回
          if (record._id===item._id) {
            // 有子分类
            if (items.length>0) {
              // item.children = items  // 不可以, 因为在直接修改状态数据
              return {...item, children: items}
            } else {
              // delete item.children // 不可以, 因为在直接修改状态数据
              const {children, ...restItem} = item  // restItem是item中除了children外的一个浅拷贝
              // const {...item2} = item
              // delete item2.children
              return restItem
            }
          } 
          return item
        })
      }
    })
  } 

  /* 
  获取所有一级分类列表
  */
  getAllSubjectList = async () => {
    const allSubjectList = await reqAllSubjectList()
    this.setState({
      allSubjectList
    })
  }

  /* 
  添加分类
  */
  addSubject = () => {

    // 得到form对象
    const form = this.formRef.current
    // 对表单进行校验
    form.validateFields()
        // .then(values => { // values是包含收集的title/parentId数据的对象
        .then(async ({parentId, title}) => {
          form.resetFields();
          // 显示按钮loading
          this.setState({
            confirmLoading: true
          })

          try {
            // 发送添加分类的请求
            await reqAddSubject(title, parentId)

            // 提示添加成功
            message.success('保存分类成功')

            // 关闭对话框
            this.setState({
              isShowAdd: false,
            })

            // 重新获取分类列表
            this.getSubjectList(1)
          } finally {// 无论请求成功或失败都要让确认按钮的loading隐藏
            this.setState({
              confirmLoading: false
            })
          }
        })
  }


  /* 
  更新分类
  */
  updateSubject = async (record) => {

    const {subjectId, subjectTitle} = this.state
    // 处理特别情况1: 没有输入
    if (subjectTitle==='') {
      message.warn('必须输入名称')
      this.inputRef.current.focus()
      return
    }
    // 处理特别情况2: 没有改变
    if (subjectTitle===record.title) {
      message.warn('没有改变, 不能更新')
      this.inputRef.current.focus()
      return
    }
    // 提交更新的请求
    await reqUpdateSubject(subjectId, subjectTitle)
    // 提示
    message.success('更新成功')
    record.title = subjectTitle
    // 变为列表查看模式
    this.setState({
      subjectId: '',
      subjectTitle: ''
    })

    // 如果更新的是一级分类列表
    if (record.parentId==='0') { // record是一级分类
      // 重新获取当前页的一级分类列表显示
      this.getSubjectList()
    } else { // 如果更新的是二级分类列表    record是二级分类
      // 找到当前二级分类的父分类对象
      const parentRecord = this.state.subjectList.items.find(item => item._id===record.parentId)
      // 重新获取当前子列表显示
      this.getAllSubSubjectList(parentRecord)
    }
  }

  /* 
  删除分类
  */
 deleteSubject = (record) => {
   return () => {
    confirm({
      title: `确定删除 ${record.title} 吗?`,
      icon: <ExclamationCircleOutlined />,
      content: '谨慎删除, 不可恢复',
      onOk: async () => {
        // 删除当前分类
        await reqDeleteSubject(record._id)
        // 提示成功
        message.success('删除成功!')

        if (record.parentId==='0') {
          // 重新获取列表显示
          const {page, subjectList:{items}} = this.state
          this.getSubjectList(items.length===1 && page>1 ? page-1 : page)
        } else {
           // 找到当前二级分类的父分类对象
          const parentRecord = this.state.subjectList.items.find(item => item._id===record.parentId)
          // 重新获取当前子列表显示
          this.getAllSubSubjectList(parentRecord)
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
   }
 }


  // 比放在render中要好一些, 数组只创建一次
  columns = [
    {
      title: '分类名称',
      dataIndex: 'title',
      key: 'title',
      render: (title, record, index) => {

        // 返回input显示
        if (this.state.subjectId===record._id) {
          return <Input 
            ref={this.inputRef}
            defaultValue={title} 
            className="subject-input-edit"
            onChange={(e) => { // 实时收集输入数据到subjectTitle
              this.setState({
                subjectTitle: e.target.value.trim()
              })
            } }
          />
        }
        // 返回title显示
        return title
      }
    },
    {
      width: '30%',
      title: '操作',
      key: 'action',
      // dataIndex: 'age',
      render: (text, record, index) => {
        if (this.state.subjectId===record._id) {
          return (
            <>
              <Button 
                type="primary" 
                className="subject-btn-edit"
                onClick={() => this.updateSubject(record)}
              >确定</Button>
              <Button onClick={() => {
                this.setState({
                  subjectId: '',
                  subjectTitle: ''
                })
              }}>取消</Button>
            </>
          )
        } else {
          return (
            <>
              <Tooltip placement="top" title='修改分类'>
                <Button 
                  type="primary" 
                  icon={<EditOutlined/>} 
                  className="subject-btn-edit"
                  onClick={() => {
                    this.setState({
                      subjectId: record._id,
                      subjectTitle: record.title
                    }, () => { // 回调函数在组件更新之后自动调用  ==> 相当于nextTick()
                      this.inputRef.current.focus() // 自动获取焦点
                    })
                  }}
                />
              </Tooltip>
              <Tooltip placement="top" title='删除分类'>
                <Button type="danger" icon={<DeleteOutlined/>} onClick={this.deleteSubject(record)}></Button>
              </Tooltip>
            </>
          )
        }
      }
    },
  ]

  render() {

    // 取出数据
    const {
      subjectList: {total, items}, 
      page, 
      pageSize, 
      loading, 
      expandedRowKeys, 
      isShowAdd, 
      allSubjectList,
      confirmLoading
    } = this.state

    // card左上角标题
    const title = <Button 
        type="primary" 
        icon={<PlusOutlined/>} 
        onClick={() => {
          this.setState({isShowAdd: true})
          this.getAllSubjectList()
        }}
      >添加新分类</Button>


    return (
      <Card title={title} className="subject">
        <Table 
          bordered
          loading={loading}
          dataSource={items} 
          columns={this.columns}
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
          expandable={{
            expandedRowKeys,	// 展开的行，控制属性
            onExpand: this.onExpand,	//点击展开图标时触发	function(expanded, record)
            onExpandedRowsChange: this.onExpandedRowsChange
          }}
        />
        
        <Modal
          confirmLoading={confirmLoading}
          visible={isShowAdd}
          title="添加分类"
          onCancel={() => {
            this.setState({
              isShowAdd: false
            })
          }}
          onOk={this.addSubject}
        >
          <Form
            ref={this.formRef}
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 14,
            }}
            layout="horizontal"
            initialValues={{
              title: '',
              parentId: undefined  // 或者不指定   Select与Input对placeholder处理不太一样
            }}
          >
            <Form.Item
              name="parentId"
              label="父级分类"
              rules={[
                {
                  required: true,
                  message: '必须选择父级分类',
                },
              ]}
            >
              <Select placeholder="请选择">
                <Select.Option value="0">一级分类</Select.Option>
                {
                  allSubjectList.map(s => <Select.Option value={s._id} key={s._id}>{s.title}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name="title"
              label="分类名称"
              rules={[
                {
                  required: true,
                  message: '必须输入分类名称',
                },
              ]}
            >
              <Input placeholder="分类名称"/>
            </Form.Item>
            
          </Form>
        </Modal>
      </Card>
    )
  }
}
