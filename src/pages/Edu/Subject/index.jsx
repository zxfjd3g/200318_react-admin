import React, { Component } from 'react'
import {Card, Button, Table, Tooltip, Modal, Form, Select, Input} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,

} from '@ant-design/icons' // 实现对内置图标的按需引入打包
import {reqSubjectList, reqAllSubSubjectList} from '@/api/edu/subject'

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
    expandedRowKeys: [], // 存储所有要打开的行的key的数组
    isShowAdd: true, // 是否显示添加的对话框
  }

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
      // 请求获取当前分类的子分类列表
      const {items} = await reqAllSubSubjectList(record._id)  // 返回数据的结构{items, total}
      // 指定为当前分类的children
      /* 
      方式一: 直接修改state中的数据, 再setState(原本的外层值)  ==> 错误的, 如果是PureComponent会发现没有变化(内部做的浅比较)
      */
      record.children = items // 不要直接修改状态数据
      this.setState({
        subjectList: this.state.subjectList
      })

      /* 
      方式二: 直接修改state中的数据, 再setState(新的外层值)  ==> 可以的, PureComponent会发现有变化(内部做的浅比较)
        不是特别好
      */
      record.children = items // 不要直接修改状态数据
      this.setState({
        subjectList: {...this.state.subjectList}
      })

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
  }

  render() {

    // 取出数据
    const {subjectList: {total, items}, page, pageSize, loading, expandedRowKeys, isShowAdd} = this.state

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
        render: (text, record, index) => (
          <>
            <Tooltip placement="top" title='修改分类'>
              <Button type="primary" icon={<EditOutlined/>} className="subject-btn-edit"></Button>
            </Tooltip>
            <Tooltip placement="top" title='删除分类'>
              <Button type="danger" icon={<DeleteOutlined/>}></Button>
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
          expandable={{
            expandedRowKeys,	// 展开的行，控制属性
            onExpand: this.onExpand,	//点击展开图标时触发	function(expanded, record)
            onExpandedRowsChange: this.onExpandedRowsChange
          }}
        />
        


        <Modal
          visible={isShowAdd}
          title="添加分类"
          onCancel={() => {
            this.setState({
              isShowAdd: false
            })
          }}
          onOk={() => {
            // form
            //   .validateFields()
            //   .then(values => {
            //     form.resetFields();
            //     onCreate(values);
            //   })
            //   .catch(info => {
            //     console.log('Validate Failed:', info);
            //   });
          }}
        >
          <Form
            
            layout="horizontal"
            initialValues={{
              title: '',
              parentId: '0'
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
                <Select.Option value="2">aa</Select.Option>
                <Select.Option value="3">bb</Select.Option>
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
