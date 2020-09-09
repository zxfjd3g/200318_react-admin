## react项目

### 项目基本介绍

- 看word文档和xind



### 项目src的目录结构

- **api**   定义接口请求方式的文件夹
- **assets**  公共的资源文件(图片,样式,字体)
- **components**  公共(可复用)的组件
- **config**   配置 
  - asyncComps.js  懒加载
  - icons 项目中用到的所有图标
  - routes 定义了几个路由
- **layouts** 主体的布局模块
- **locales**  实现国际化的文件夹
- **pages**  页面(组件)
- **redux**   redux
- **utils**  公共js(提供工具函数)



### 搭建本地服务

**环境介绍**

- nodejs
- mongodb 注意: mongodb服务必须启动
- 全局安装包    **npm i pm2 nodemon apidoc -g**
  - pm2 生产环境 进程守护
  - nodemon 开发环境 自动重启
  - apidoc 自动生成 API 文档

**使用步骤**

1. 克隆 server 仓库: https://github.com/zxfjd3g/react-admin-server
2. npm i 下载所有依赖包
3. 启动服务器: npm start, 端口号是5000
4. **初始化 / 重置** 本地数据库数据: 
   1. **npm run reset**
   2. 使用mongodb客户端工具导入mongodb的json数据文件
5. 指定前端项目代理的目标服务器地址为:  http://localhost:5000
   - package.json --> proxy --> http://localhost:5000





**mongoimport --db react_admin --collection chapters --file D:\work\React项目\代码\react-admin-server_final\test\dbs\react_admin.chapters.json**



### 开发组件流程(新建分类组件演示)

1. 新建路由组件Subject: pages/Edu/Subject/index.jsx
2. 在config/asyncComps.js中引入并暴露
3. 在菜单管理中给 教育管理 添加 分类管理 子菜单 
   1. 菜单名: 分类管理
   2. 访问路径 /subject/list
   3. 组件名称: Subject
4. 在 角色管理 给当前用户对应的角色添加 分类管理 的权限
5. 后面就可以在Subject的路由组件中完成功能



## 课程分类管理

### 测试相关接口

- 在线文档: http://localhost:5000/docs
- 测试工具: apidoc + postman

### 定义相关接口请求函数

```javascript
/* 
课程分类管理接口请求函数
*/

import request from "@/utils/request"

const BASE_URL = "/admin/edu/subject"

/* 
获取课程一级分类数据(分页)
http://localhost:5000/admin/edu/subject/:page/:limit GET
*/
export function reqSubjectList (page,pageSize) {
  return request({
    url: `${BASE_URL}/${page}/${pageSize}`,
    method: "GET",
  })
}

/* 
获取所有课程一级分类数据
http://localhost:5000/admin/edu/subject GET
*/
export function reqAllSubjectList() {
  return request({
    url: `${BASE_URL}`,
    method: "GET",
  })
}

/* 
通过一级分类id，获取该一级分类下属的所有二级分类
http://localhost:5000/admin/edu/subject/get/:parentId GET
*/
export function reqAllSubSubjectList(parentId) {
  return request({
    url: `${BASE_URL}/get/${parentId}`,
    method: "GET",
  })
}

/* 
添加课程分类
http://localhost:5000/admin/edu/subject/save POST
title/parentId
*/
export function reqAddSubject(title,parentId) {
  return request({
	url: `${BASE_URL}/save`,
    method: "POST",
	data:{title,parentId},
  })
}

/* 
更新课程分类
http://localhost:5000/admin/edu/subject/update PUT id/title
*/
export function reqUpdateSubject(id,title) {
  return request({
	url: `${BASE_URL}/update`,
    method: "PUT",
	data:{id,title},
  });
}

/* 
删除课程分类
http://localhost:5000/admin/edu/subject/remove/:id DELETE
*/
export function reqDeleteSubject(id) {
  return request({
	url: `${BASE_URL}/remove/${id}`,
    method: "DELETE",
  })
}
```



### 一级分类列表动态显示

```js
import React, { Component } from 'react'
import {Card, Button, Table, Tooltip} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

import { reqSubjectList } from '@/api/edu/subject'
import './index.less'

/* 
课程分类管理路由组件
*/
export default class Subject extends Component {

  state = {
    subjectList: { // 包含列表数组和总数量的对象
      items: [],
      total: 0
    },
    page: 1, // 当前页码
    pageSize: 5, // 每页数量
  }

  // 初始获取默认的第一页列表显示
  componentDidMount () {
    this.getSubjectList()
  }

  /* 
  请求获取指定页码和每页数量的分页列表显示
  */
  getSubjectList = async (page=this.state.page, pageSize=this.state.pageSize) => {
    // 更新page和pageSize
    this.setState({
      page,
      pageSize
    })
    // 请求获取分页数据
    const subjectList = await reqSubjectList(page, pageSize)
    // 更新分页数据
    this.setState({
      subjectList
    })
  }
  
  /* 
  Table的列配置 ==> 相当于elementUI的el-table-column
  */
  columns = [
    {
      title: '分类名称',
      key: "title",
      dataIndex: 'title',
    },
    {
      title: '操作',
      width: '30%',
      key: "action",
      // 如果当前列不仅仅是直接显示对象的属性值, 就需要用render
      render: (text, record, index) => {
        return (
          <Tooltip title="修改分类">
            <Button type="primary" className="edit_btn" icon={<EditOutlined/>}></Button>
          </Tooltip>
          <Tooltip title="删除分类">
          	<Button type="danger" icon={<DeleteOutlined/>}></Button>
      	  </Tooltip>
        )
      }
    },
  ]

  render() {
    const {subjectList:{items, total}, page, pageSize} = this.state

    return (
      <Card>
        <Button type="primary">
          <PlusOutlined/>
          新建
        </Button>

        <Table
          bordered
          rowKey="_id" // 必须指定列表key为_id
          columns={this.columns}
          dataSource={items}
          pagination={{
            current: page,
            total,
            pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [5, 10, 15],
            onChange: this.getSubjectList,
            onShowSizeChange: (current, pageSize) => this.getSubjectList(1, pageSize)
          }} 
        />
      </Card>
    )
  }
}
```



### 二级分类列表动态显示

- 树形列表

  -  table树形数据展示例子
  -  table的expandable属性配置
     -  expandedRowKeys: 展开行的key的数组, 控制属性
     -  onExpandedRowsChange: 展开的行变化时触发
     -  onExpand: 点击展开图标时触发

- 如何带展开图标?

  ```javascript
  // 让每个一级分类对象都有一个children数组属性 ==> 带展开图标
  subjectList.items.forEach(item => item.children = [])
  ```

- 功能列表

  -  动态加载/请求二级分类列表显示
  -  如果没有二级分类, 去掉展开图标
-  解决翻页时可能会自动展开
     -  原因: table内部自动保存了我们点击展开的所有行的key的数组, 翻页也还在
     -  我们通过expandedRowKeys来控制控制哪一行展开
        -  将expandedRowKeys传递给expandable
        -  在handleExpandedRowsChange回调中保存最新的expandedRowKeys
        -  当翻页时清空expandedRowKeys(在getSubjectList中处理)

```jsx
<Table         
    ...
    expandable={{
		expandedRowKeys,
        onExpandedRowsChange: this.handleExpandedRowsChange,
        onExpand: this.handleExpand
    }}
/>

state = {
	expandedRowKeys: [], // 所有展开的一级分类的id数组
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
            const {children, ...restItem} = item  // restItem是item中除了children的一个浅拷贝
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
```



### 添加分类

- 设计状态

```javascript
isShowAdd: false, // 是否显示添加界面
confirmLoading: false, // 是否显示确定按钮的loading
```

- 添加界面

```jsx
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
          allSubjectList.map(s => 
              <Select.Option value={s._id} key={s._id}>{s.title}</Select.Option>)
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
```



- 显示添加界面

```javascript
const title = <Button 
    type="primary" 
    icon={<PlusOutlined/>} 
    onClick={() => {
      this.setState({isShowAdd: true})
      this.getAllSubjectList()
    }}
  >添加新分类</Button>  
```

- 请求添加分类

```jsx
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
```



### 修改分类

- 设计state

```
subjectId: '', // 修改分类的id
subjectTitle: '', // 修改分类的标题
```

- Table的列配置

  ```jsx
  /* 
  Table的列配置 ==> 相当于elementUI的el-table-column
  */
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
                <Button type="danger" icon={<DeleteOutlined/>} 
                    onClick={this.deleteSubject(record)}></Button>
              </Tooltip>
            </>
          )
        }
      }
    },
  ]
  ```

- 显示更新界面

```
<Tooltip placement="top" title='修改分类'>
  <Button 
    type="primary" 
    icon={<EditOutlined/>} 
    className="subject-btn-edit"
    disabled={this.state.subjectId}
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
```



- 请求更新分类

```javascript
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
    const parentRecord = this.state.subjectList.items.find(
        item => item._id===record.parentId)
    // 重新获取当前子列表显示
    this.getAllSubSubjectList(parentRecord)
  }
}
```

### 删除分类

```javascript
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
        // 如果删除的是一级分类
        if (record.parentId==='0') {
          // 重新获取列表显示
          const {page, subjectList:{items}} = this.state
          this.getSubjectList(items.length===1 && page>1 ? page-1 : page)
        } else { // 如果删除的是二级分类
          // 找到当前二级分类的父分类对象
          const parentRecord = this.state.subjectList.items.find(
              item => item._id===record.parentId)
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
```



### 使用Hooks语法实现

```jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Card, 
  Button, 
  Table, 
  Tooltip, 
  Modal, 
  Form, 
  Select,
  Input, 
  message
} from 'antd'
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
export default function Subject (props) {

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(3)
  const [subjectList, setSubjectList] = useState({
    items: [], // 当前页的数组
    total: 0,  // 总数量
  })
  const [allSubjectList, setAllSubjectList] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [isShowAdd, setIsShowAdd] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const [subjectTitle, setSubjectTitle] = useState('')
  const [form] = Form.useForm()

  // 用于保存<Input>的ref容器
  const inputRef = useRef(null)

  useEffect(() => {
    // 获取第一页显示
    getSubjectList()
  }, [])

  useEffect(() => { // 相当于监视的subjectId的变化, 且是在界面已更新了才执行
    if (subjectId) { // 已经显示input了
      inputRef.current.focus() // 自动获取焦点
    }
  }, [subjectId])

  const getSubjectList = async (p=page, ps=pageSize) => {

    // 显示Loading
    setExpandedRowKeys([])
    setLoading(true)

    // 发ajax请求获取分页列表数据
    const subjectList = await reqSubjectList(p, ps)

    // 整理数据: 给每个subject添加一个cheldren属性
    subjectList.items.forEach(subject => subject.children = [])

    // 更新状态
    setLoading(false)
    setSubjectList(subjectList)
    setPage(p)
    setPageSize(ps)
    setSubjectId('')
    setSubjectTitle('')
  }

  /* 
  展开的行变化时触发
  */
  const onExpandedRowsChange  = (expandedRows) => {
    console.log('onExpandedRowsChange()', expandedRows)
    // 更新对应的状态
    setExpandedRowKeys(expandedRows)
  }

  /* 
  点击展开/关闭图标
  record: 当前行数据(分类对象)
  */
  const onExpand = async (expanded, record) => {
    console.log('onExpand', expanded, record)
    // 如果当前是展开
    if (expanded) {
      getAllSubSubjectList(record)
    }
  }

  /* 
  获取指定一级分类的所有二级列表显示
  record: 一级分类对象
  */
  const getAllSubSubjectList = async (record) => {
    // 请求获取当前分类的子分类列表
    const {items} = await reqAllSubSubjectList(record._id)  // 返回数据的结构{items, total}
    // 指定为当前分类的children

    /* 
    方式三: 完全产生一个新的数据, 再setState指定这个新数据
    */
    setSubjectList({
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
            const {children, ...restItem} = item  // restItem是item中除了children的一个浅拷贝
            // const {...item2} = item
            // delete item2.children
            return restItem
          }
        } 
        return item
      })
    })
  } 

  /* 
  获取所有一级分类列表
  */
  const getAllSubjectList = async () => {
    const allSubjectList = await reqAllSubjectList()
    setAllSubjectList(allSubjectList)
  }

  /* 
  添加分类
  */
  const addSubject = () => {

    // 对表单进行校验
    form.validateFields()
        // .then(values => { // values是包含收集的title/parentId数据的对象
        .then(async ({parentId, title}) => {
          form.resetFields();
          // 显示按钮loading
          setConfirmLoading(true)

          try {
            // 发送添加分类的请求
            await reqAddSubject(title, parentId)

            // 提示添加成功
            message.success('保存分类成功')

            // 关闭对话框
            setIsShowAdd(false)

            // 重新获取分类列表
            getSubjectList(1)
          } finally {// 无论请求成功或失败都要让确认按钮的loading隐藏
            setConfirmLoading(false)
          }
        })
  }


  /* 
  更新分类
  */
  const updateSubject = async (record) => {

    // 处理特别情况1: 没有输入
    if (subjectTitle==='') {
      message.warn('必须输入名称')
      inputRef.current.focus()
      return
    }
    // 处理特别情况2: 没有改变
    if (subjectTitle===record.title) {
      message.warn('没有改变, 不能更新')
      inputRef.current.focus()
      return
    }
    // 提交更新的请求
    await reqUpdateSubject(subjectId, subjectTitle)
    // 提示
    message.success('更新成功')
    record.title = subjectTitle

    // 变为列表查看模式
    setSubjectId('')
    setSubjectTitle('')

    // 如果更新的是一级分类列表
    if (record.parentId==='0') { // record是一级分类
      // 重新获取当前页的一级分类列表显示
      getSubjectList()
    } else { // 如果更新的是二级分类列表    record是二级分类
      // 找到当前二级分类的父分类对象
      const parentRecord = subjectList.items.find(item => item._id===record.parentId)
      // 重新获取当前子列表显示
      getAllSubSubjectList(parentRecord)
    }
  }

  /* 
  删除分类
  */
  const deleteSubject = (record) => {
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
            getSubjectList(subjectList.items.length===1 && page>1 ? page-1 : page)
          } else {
            // 找到当前二级分类的父分类对象
            const parentRecord = subjectList.items.find(
                item => item._id===record.parentId)
            // 重新获取当前子列表显示
            getAllSubSubjectList(parentRecord)
          }
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    }
  }

  // 比放在render中要好一些, 数组只创建一次
  const columns = [
    {
      title: '分类名称',
      dataIndex: 'title',
      key: 'title',
      render: (title, record, index) => {

        // 返回input显示
        if (subjectId===record._id) {
          return <Input 
            ref={inputRef}
            defaultValue={title} 
            className="subject-input-edit"
            onChange={(e) => { // 实时收集输入数据到subjectTitle
              setSubjectTitle(e.target.value.trim())
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
        if (subjectId===record._id) {
          return (
            <>
              <Button 
                type="primary" 
                size="small"
                className="subject-btn-edit"
                onClick={() => updateSubject(record)}
              >确定</Button>
              <Button 
                size="small"
                onClick={() => {
                  setSubjectId('')
                  setSubjectTitle('')
                }}
              >取消</Button>
            </>
          )
        } else {
          return (
            <>
              <Tooltip placement="top" title='修改分类'>
                <Button
                  disabled={subjectId}
                  type="primary" 
                  icon={<EditOutlined/>} 
                  className="subject-btn-edit"
                  onClick={() => {
                    setSubjectId(record._id)
                    setSubjectTitle(record.title)
                  }}
                />
              </Tooltip>
              <Tooltip placement="top" title='删除分类'>
                <Button type="danger" icon={<DeleteOutlined/>} 
                    onClick={deleteSubject(record)}></Button>
              </Tooltip>
            </>
          )
        }
      }
    },
  ]

  // card左上角标题
  const title = <Button 
    type="primary" 
    icon={<PlusOutlined/>} 
    onClick={() => {
      setIsShowAdd(true)
      getAllSubjectList()
    }}
  >添加新分类</Button>


  return (
    <Card title={title} className="subject">
      <Table 
        bordered
        loading={loading}
        dataSource={subjectList.items} 
        columns={columns}
        rowKey="_id"
        pagination={{
          current: page,
          pageSize,
          total: subjectList.total,
          pageSizeOptions: [3, 6, 9, 12],
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => `共${total}条`,
          onChange: getSubjectList,
          onShowSizeChange: (current, pageSize) => getSubjectList(1, pageSize),
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
        title="添加分类"
        onCancel={() => {
          form.resetFields()
          setIsShowAdd(false)
        }}
        onOk={addSubject}
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
                allSubjectList.map(s => 
                    <Select.Option value={s._id} key={s._id}>{s.title}</Select.Option>)
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
```



## 章节管理

### 功能列表:

- 搜索章节分页列表
- 章节下的课时列表
- 添加章节
- 添加课时
- 播放视频
- 删除章节
- 删除课时
- 修改章节
- 修改课时

### 定义相关接口请求函数

- 课程接口请求函数: course.js

```javascript
import request from "@/utils/request"

// 模块请求公共前缀
const BASE_URL = "/admin/edu/course"

/* 
获取所有课程数据
*/
export function reqAllCourseList() {
  return request(BASE_URL)
}

/* 
获取课程分页列表数据
*/
export function reqCourseList({
  page,
  limit,
  teacherId,
  subjectId,
  subjectParentId,
  title
}) {
  return request({
    url: `${BASE_URL}/${page}/${limit}`,
    method: "GET",
    params: {
      teacherId,
      subjectId,
      subjectParentId,
      title,
    },
  })
}
```



- 章节接口请求函数: chapter.js

```javascript
import request from "@/utils/request"

// 模块请求公共前缀
const BASE_URL = "/admin/edu/chapter"

/* 
获取某个课程的章节分页列表
*/
export function reqChapterList({ page, pageSize, courseId }) {
  return request({
    url: `${BASE_URL}/${page}/${pageSize}`,
    method: "GET",
    params: {
      courseId,
    },
  })
}

/* 
添加章节(某个课程下的)
*/
export function reqAddChapter(courseId, title) {
  return request({
    url: `${BASE_URL}/save`,
    method: "POST",
    data: {
      courseId,
      title
    },
  })
}

/* 
更新章节
*/
export function reqUpdateChapter(chapterId, title) {
  return request({
    url: `${BASE_URL}/update`,
    method: "PUT",
    data: {
      chapterId,
      title
    },
  })
}

/* 
删除章节
*/
export function reqRemoveChapter(id) {
  return request({
    url: `${BASE_URL}/remove/${id}`,
    method: "DELETE",
  })
}
```



- 课时接口请求函数: lesson.js

```javascript
import request from "@/utils/request"

// 模块请求公共前缀
const BASE_URL = "/admin/edu/lesson"

/* 
获取指定章节下的所有课时列表
*/
export function reqLessonList(chapterId) {
  return request({
    url: `${BASE_URL}/get/${chapterId}`,
    method: "GET",
  })
}

/* 
新增课时
*/
export function reqAddLesson({ chapterId, title, free, video }) {
  return request({
    url: `${BASE_URL}/save`,
    method: "POST",
    data: {
      chapterId,
      title,
      free,
      video,
    },
  })
}

/* 
删除课时列表
*/
export function reqRemoveLesson(id) {
  return request({
    url: `${BASE_URL}/remove/${id}`,
    method: "DELETE"
  })
}
```



### 使用redux管理章节管理相关数据

> 先查看项目中redux的结构
>
> 指定组件使用的redux应该定义在组件文件夹内
>
> /Chapter/redux
>
> ​	/actions.js  
>
> ​	/ reducer.js
>
> ​	/ constants.js
>
> ​	/ index.js  汇总当前redux,暴露给外面使用
>
>
> redux/reducer/index.js 合并reducer

- contants.js

```javascript
export const GET_ALL_COURSE_LIST = 'get_all_course_list' // 获取所有课程列表
export const GET_CHAPTER_LIST = 'get_chapter_list' // 获取章节分页列表
export const GET_LESSON_LIST = 'get_lesson_list' // 获取课时列表
```

- actoins.js

```javascript
import {reqAllCourseList} from "@/api/edu/course"
import { reqChapterList } from '@/api/edu/chapter'
import { reqLessonList } from '@/api/edu/lesson'

import {
  GET_ALL_COURSE_LIST,
  GET_CHAPTER_LIST,
  GET_LESSON_LIST,
} from "./constants"

/**
 * 获取所有课程列表
 */
const getAllCourseListSync = (allCourseList) => ({
  type: GET_ALL_COURSE_LIST,
  data: allCourseList,
})

export const getAllCourseList = () => {
  return (dispatch) => {
    reqAllCourseList().then(allCourseList => {
      dispatch(getAllCourseListSync(allCourseList))
    })
  }
}

/* 
获取指定课程下的章节分页列表
*/
const getChapterListSync = ({page, pageSize, course, chapterList}) => ({
  type: GET_CHAPTER_LIST,
  data: {page, pageSize, course, chapterList},
})

export const getChapterList = ({ page, pageSize, course }) => {
  return (dispatch) => {
    return reqChapterList({ page, pageSize, courseId:course._id })
        .then(({total, items}) => {
            dispatch(getChapterListSync({
                page,
                pageSize,
                course,
                chapterList: {total, items},
            }))
        })
  }
}

/* 
获取指定章节下所有课时列表
*/
const getLessonListSync = ({chapterId, lessons}) => ({
  type: GET_LESSON_LIST,
  data: {chapterId, lessons},
})

export const getLessonList = (chapterId) => {
  return (dispatch) => {
    return reqLessonList(chapterId).then((lessons) => {
      dispatch(getLessonListSync({chapterId, lessons}))
    })
  }
}
```



- reducers.js

```javascript
import { 
  GET_ALL_COURSE_LIST,
  GET_CHAPTER_LIST,
  GET_LESSON_LIST
} from "./constants"

const initChapter = {
  allCourseList: [], // 所有课程数组
  page: 1, // 当前页码
  pageSize: 3,  // 每页数量
  course: {}, // 章节所属课程 
  chapterList: {  // 章节分页数据
    total: 0, // 总数量
    items: [] // 当前页数组
  }
}

export default function chapter (prevState=initChapter, action) {
  switch (action.type) {
    case GET_ALL_COURSE_LIST: // 获取所有课程列表
      const allCourseList = action.data
      return {...prevState, allCourseList}
    
    case GET_CHAPTER_LIST:  // 获取章节分页列表
      const {page, pageSize, chapterList, course} = action.data
      // 添加children属性
      chapterList.items.forEach(item => item.children = [])
      return {allCourseList: prevState.allCourseList, chapterList, page, pageSize, course}
    
    case GET_LESSON_LIST: // 获取课时列表
      const {chapterId, lessons} = action.data
      let {total, items} = prevState.chapterList
      items = items.map(chapter => {
        if (chapter._id===chapterId) {
          if (lessons.length===0) {
            const {children, ...restChapter} = chapter
            return restChapter
          } else {
            return {...chapter, children: lessons}
          }
        } 
        return chapter
      })
      return {
        ...prevState,
        chapterList: {
          total,
          items
        }
      }
    default:
      return prevState
  }
}
```



- index.js

```javascript
/* 
向外暴露reducer和action
*/
import chapter from "./reducers"
import { getAllCourseList, getChapterList, getLessonList } from "./actions"

export { chapter, getAllCourseList, getChapterList, getLessonList }
```



- redux/reducer/index.js: 合并reducer

```javascript
...
import { chapter } from "@/pages/Edu/Chapter/redux"

export default combineReducers({
  ...
  chapter
})
```



### 章节管理路由组件

```javascript
import React from 'react'
import Search from './components/Search'
import List from './components/List'
/* 
章节管理路由组件
*/
export default function Chapter () {

  return (
    <div>
      <Search/>
      <List/>
    </div>
  )
}
```



### 章节路由的子组件: Search组件

```javascript
import React, { useEffect } from 'react'
import {
  Form,
  Select,
  Button,
  message,
} from 'antd'
import {connect} from 'react-redux'

import { getAllCourseList, getChapterList } from '../../redux/index'
import './index.less'

const {Option} = Select

/* 
搜索UI组件
*/
function Search({
  allCourseList,
  pageSize,
  course,
  getAllCourseList,
  getChapterList
}) {
  // 得到form对象
  const [form] = Form.useForm()

  // 初始化异步获取所有课程列表
  useEffect(() => {
    getAllCourseList()
  }, [])

  // 表单校验成功回调
  const onFinish = async ({courseIdTitle}) => {
    const [_id, title] = courseIdTitle.split(':')
    // 异步搜索章节列表
    await getChapterList({ page: 1, pageSize, course: {_id, title} })
    message.success('搜索章节成功')
  }

  return (
    <Form 
      form={form} 
      layout="inline" 
      onFinish={onFinish}
      className="chapter-search"
      initialValues={{
        courseIdTitle: course._id ? course._id+':'+course.title : undefined
      }}
    >
      <Form.Item
        label="选择课程"
        name="courseIdTitle"
        rules={[
          {
            required: true,
            message: '请先选择课程',
          }
        ]}
      >
        <Select 
          className="chapter-search-select" 
          placeholder="请选择"
          allowClear
        >
          {
            allCourseList.map(c => (
              <Option value={c._id+':'+c.title} key={c._id}>{c.title}</Option>
            ))
          }
          
        </Select>
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="chapter-search-btn"
        >
          搜索
        </Button>
        <Button onClick={() => form.setFieldsValue({courseIdTitle: undefined})}>取消</Button>
      </Form.Item>
    </Form>
  )
}

export default connect(
  state => ({
    allCourseList: state.chapter.allCourseList,
    pageSize: state.chapter.pageSize,
    course: state.chapter.course,
  }),
  {
    getAllCourseList, 
    getChapterList
  }
)(Search)
```



### 章节路由的子组件: List组件

```jsx
import React, {useState, useEffect} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
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
import {
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import Player from 'griffith'

import {
  reqAddChapter,
  reqRemoveChapter
} from '@/api/edu/chapter'
import {
  reqRemoveLesson
} from '@/api/edu/lesson'
import {getChapterList, getLessonList} from '../../redux'
import './index.less'


function List ({
  page,
  pageSize,
  course,
  chapterList: {total, items},
  getChapterList,
  getLessonList,
  history
}) {

  const [form] = Form.useForm()
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [isShowChapterAdd, setIsShowChapterAdd] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [lesson, setLesson] = useState({})
  const [isShowVideoModal, setIsShowVideoModal] = useState(false)

  /* 
  Table的列
  */
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
      render: free => {
        return free===undefined ? '' : free ? '是' : '否'
      }
    },

    {
      title: '视频',
      dataIndex: 'video',
      key: 'video',
      render: (video, record) => {
        if (video) {
          return (
            <Tooltip title="预览视频">
              <Button onClick={() => showVideoModal(record)}>
                <EyeOutlined />
              </Button>
            </Tooltip>
          )
        }
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
              <Tooltip placement="top" title='更新课时'>
                <Button type="primary" icon={<EditOutlined />} className="btn-update"></Button>
              </Tooltip>
              <Tooltip placement="top" title='删除课时'>
                <Button type="danger" icon={<DeleteOutlined />} onClick={() => removeChapterOrLesson(record)}></Button>
              </Tooltip>
            </>
          )
        } else {
          return (
            <>
              <Tooltip placement="top" title='添加课时'>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    history.push('/edu/chapter/addlesson', record)
                  }}
                ></Button>
              </Tooltip>
              <Tooltip placement="top" title='更新章节'>
                <Button type="primary" icon={<EditOutlined />} className="btn-update"></Button>
              </Tooltip>
              <Tooltip placement="top" title='删除章节'>
                <Button type="danger" icon={<DeleteOutlined />} onClick={() => removeChapterOrLesson(record)}></Button>
              </Tooltip>
            </>
          )
        }
      }
    },

  ]

  /* 
  显示视频对话框
  */
  const showVideoModal = (lesson) => {
    setLesson(lesson)
    setIsShowVideoModal(true)
  }

  /* 
  行展开发生改变时触发
  */
  const onExpandedRowsChange = (expandedRowKeys) => {
    setExpandedRowKeys(expandedRowKeys)
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
  获取章节分页列表
  */
  const getChapters = (p=page, ps=pageSize) => {
    setPage(p)
    setExpandedRowKeys([])
    getChapterList({page: p, pageSize: ps, course})
  }

  /* 
  添加章节
  */
  const addChapter = async () => {
    const {title} = await form.validateFields()
    setConfirmLoading(true)
    await reqAddChapter(course._id, title)
    form.resetFields()
    setConfirmLoading(false)
    setIsShowChapterAdd(false)
    message.success('添加章节成功!')
    getChapters(1)
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

  /* 
  Card右上角界面
  */
  const extra = (
    <div className="chapter-list-extra">
      <Button 
        type="primary" 
        icon={<PlusOutlined/>}
        disabled={!course._id}
        onClick={() => {
          setIsShowChapterAdd(true)
        }}
      >新增章节</Button>
      <FullscreenOutlined/>
      <ReloadOutlined/>
    </div>
  )

  return (
    <Card className="chapter-list" title="课程章节列表" extra={extra}>
      <Table
        bordered
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
        title="添加章节"
        visible={isShowChapterAdd}
        onOk={addChapter}
        confirmLoading={confirmLoading}
        onCancel={() => {
          form.resetFields()
          setIsShowChapterAdd(false)
        }}
      >
        <Form form={form} layout="horizontal">
          <Form.Item 
            label="章节名称" 
            name="title"
            rules={[
              {
                required: true,
                message: '请输入章节名称',
              },
            ]}
          >
            <Input placeholder="请输入章节名称"/>
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
    pageSize: state.chapter.pageSize,
    page: state.chapter.page,
    course: state.chapter.course,
    chapterList: state.chapter.chapterList
  }),
  {
    getChapterList,
    getLessonList
  }
)(List))
```



### 添加课时路由组件: addLesson组件

```jsx
import React from 'react'
import {
  Card,
  PageHeader,
  Form,
  Input,
  Switch,
  Button,
  message,
} from 'antd'

import { reqAddLesson } from '@/api/edu/lesson'
import Upload from '@/components/Upload'

// 表单的布局
const layout = {
  labelCol: { span: 2 }, // label文字所占宽度比例
  wrapperCol: { span: 8 }, // 右边表单项所占宽度比例
}

export default function AddLesson({
  location,
  history
}) {


  // 得到路由跳转携带的state数据
  const chapter = location.state

  const onFinish = async (values) => {
    // 得到章节id
    const chapterId = chapter._id
    // 请求添加课时
    await reqAddLesson({ ...values, chapterId })
    // 提示成功
    message.success("添加课时成功")
    // 跳转到列表界面
    history.replace("/edu/chapter/list")
  }

  return (
    <Card
      title={
        <PageHeader
          className="add-lesson-header"
          onBack={() => history.replace("/edu/chapter/list")}
          title="新增课时"
        />
      }
    >
      <Form 
        {...layout} 
        onFinish={onFinish} 
        initialValues={{ free: true }}
      >
        <Form.Item label="章节名称">
          <span>{chapter.title}</span>
        </Form.Item>
        <Form.Item
          label="课时名称"
          name="title"
          rules={[{ required: true, message: "请输入课时名称~" }]} // 校验规则
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="是否免费"
          name="free"
          rules={[{ required: true, message: "请选择是否免费" }]}
          // Form表单默认会接管组件value属性
          // 但是Switch组件的数据属性是checked
          valuePropName="checked"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" defaultChecked/>
        </Form.Item>

        <Form.Item
          label="视频"
          name="video"
          rules={[{ required: true, message: "请上传视频" }]}
        >
          <Upload />
        </Form.Item>

        <Form.Item label="">
          <Button type="primary" htmlType="submit" className="add-lesson-btn">
            添加
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
```



### 视频上传七牛云

#### 封装视频上传组件

```jsx
import React, { useState, useEffect, useRef } from "react"
import {
  Button,
  Upload as AntdUpload,
  message,
} from "antd"
import { UploadOutlined } from "@ant-design/icons"
import * as qiniu from "qiniu-js" // 七牛上传SDK
import { nanoid } from "nanoid" // 用来生成唯一id

import { reqUploadToken } from "@/api/edu/upload"

import qiniuConfig from "@/config/qiniu"

const MAX_VIDEO_SIZE = 35 * 1024 * 1024 // 35mb

export default function Upload (props) {

  const [uploadToken, setUploadToken] = useState('')
  const [expires, setExpires] = useState(0)
  const [isUploadSuccess, setIsUploadSuccess] = useState(false)
  const subRef = useRef(null)

  // 初始获取上传需要的token
  useEffect(() => {
    getUploadToken()

    return () => {
      subRef.current && subRef.current.unsubscribe()
    }
  }, [])

  /* 
  获取上传需要的token
  */
  const getUploadToken = async () => {
    let token = uploadToken
    let exp = expires
    if (!exp) {
      // 从本地读取数据，并解析成对象
       const data = JSON.parse(localStorage.getItem("upload_token")) || {}
       // 取出其中的token值和失效时间
       token = data.uploadToken
       exp = data.expires
    }
    
    // 如果在有效期内
    if (exp < Date.now()) {
      // 如果原本状态没有值, 保存token和expires
      if (!expires) {
        setUploadToken(token)
        setExpires(expires)
      }
    } else {
      // 如果有数据, 清除数据(数据已过期)
      if (exp) {
        setUploadToken('')
        setExpires('')
        localStorage.removeItem('upload_token')
      }
      // 请求获取token和expires数据
      const data = await reqUploadToken()
      // 将过期时间修正为时间数值, 并提前一点
      data.expires = Date.now() + expires * 1000 - 5 * 60 * 1000
      // 保存数据到state和local中
      setUploadToken(data.uploadToken)
      setExpires(data.expires)
      localStorage.setItem("upload_token", JSON.stringify(data))
    }
  }

  /* 
  在提交上传请求前调用
  可以返回布尔值或promise, 用于告知是否需要发请求
  promise的方式用于检查中包含异步操作
  如果是promise, 不发请求, 调用reject(), 如果是需要发请求, 调用resolve(file)
  */
  const beforeUpload = (file, fileList) => {
    return new Promise((resolve, reject) => {
      // 如果文件超过了大小, 不提交请求
      if (file.size > MAX_VIDEO_SIZE) {
        message.warn('上传视频不能超过35mb')
        reject()
        return
      }

      // 获取到有效的token后, 才允许提交上传请求
      getUploadToken().then(() => resolve(file))
    })
  }

  /* 
  自定义上传视频方案
  */
  const customRequest = ({file, onProgress, onSuccess, onError}) => {

    const key = nanoid(10) // 唯一标识
    const putExtra = {
      mimeType: ['video/*'] // 指定文件类型
    }
    const config = {
      region: qiniu.region.z2 // 代表华南地区
    }

    // 创建上传文件对象
    const observable = qiniu.upload(
      file, // 要上传的文件
      key, // 上传文件的名称(唯一)
      uploadToken, // 身份标识token
      putExtra, // 指定接收文件类型的配置
      config // 指定服务器地区的配置
    )

    // 创建上传的观察对象
    const observer = {
      next(res){ // 显示进度
        console.log('next()', JSON.stringify(res))
        const percent = res.total.percent
        onProgress({percent})
      },
      error(err){ 
        console.log('error()', err)
        // 指定上传错误
        onError(err)
        message.error('上传视频失败')
      },
      complete(res){ 
        console.log('complete', res)
        // 指定上传成功
        onSuccess(res)
        message.success("上传视频成功")
        // 根据返回的视频key值, 确定视频的url
        const video = qiniuConfig.prefix_url + res.key
        // 保存到表单项数据中
        props.onChange(video)
        // 保存上传成功的标识值
        setIsUploadSuccess(true)
      }
    }

    // 开始上传
    const subscription = observable.subscribe(observer) // 上传开始

    // 保存用于取消订阅的对象
    subRef.current = subscription
  }

  /* 
  删除视频
  */
  const onRemove = () => {
    // 上传取消
    subRef.current && subRef.current.unsubscribe()
    // 让表单保存video为''
    props.onChange("")
    // 标识没有上传成功的视频
    setIsUploadSuccess(false)
  }

  return (
    <AntdUpload
      accept="video/*"
      listType="picture"
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onRemove={onRemove}
    >
      {
        !isUploadSuccess && (
          <Button icon={<UploadOutlined/>} disabled={!uploadToken}>上传视频</Button>
        )
      }
    </AntdUpload>
  )
}

```



#### 七牛云

>上传视频到七牛云要看的文档

登录官网 -> 服务与中心 -> SDK&工具 -> 官方SDK -> JS -> 文档

```js
//下载七牛云
npm install qiniu-js
//下载生成唯一id的库
npm install nanoid 
// 引入
import * as qiniu from 'qiniu-js'
import { nanoid } from 'nanoid'

/* 
自定义上传视频方案
*/
const customRequest = ({file, onProgress, onSuccess, onError}) => {

  const key = nanoid(10) // 唯一标识
  const putExtra = {
    mimeType: ['video/*'] // 指定文件类型
  }
  const config = {
    region: qiniu.region.z2 // 代表华南地区
  }

  // 创建上传文件对象
  const observable = qiniu.upload(
    file, // 要上传的文件
    key, // 上传文件的名称(唯一)
    uploadToken, // 身份标识token
    putExtra, // 指定接收文件类型的配置
    config // 指定服务器地区的配置
  )

  // 创建上传的观察对象
  const observer = {
    next(res){ 
      // console.log('next()', JSON.stringify(res))
      // 显示上传进度
      const percent = res.total.percent
      onProgress({percent})
    },
    error(err){ 
      // console.log('error()', err)
      // 指定上传错误
      onError(err)
      message.error('上传视频失败')
    },
    complete(res){ 
      // console.log('complete', res)
      // 指定上传成功
      onSuccess(res)
      message.success("上传视频成功")
      // 根据返回的视频key值, 确定视频的url
      const video = qiniuConfig.prefix_url + res.key
      // 保存到表单项数据中
      props.onChange(video)
      // 保存上传成功的标识值
      setIsUploadSuccess(true)
    }
  }

  // 开始上传
  const subscription = observable.subscribe(observer) // 上传开始

  // 保存用于取消订阅的对象
  subRef.current = subscription
}
```

#### 七牛云上传凭证需要修改的配置

```js
// 上传凭证token 七牛云 --> 产品手册 -> 安全机制 -> 上传凭证
// 注意: 生成token是服务器代码.本地服务中已经写好,但是需要修改一些成自己的账号信息
// 在本地服务器的config/index.js中修改
// 分别修改成自己的信息 
// ACCESS_KEY 和 SECRET_KEY 从个人中心/秘钥管理中获取
// BUCKET 从管理控制台/对象存储/空间管理 中查找
const ACCESS_KEY = "E7nFXkXGiqs5RxkOPFOGprfPN2SyyNDkwyk4CdLn";
const SECRET_KEY = "aFgqIUxJhkDrWyDaqxfOF9a67hEQi0GmqVzlJ8QC";
const BUCKET = "atguigu-200317"; // 对象存储的标识名称
```

#### 定义获取七牛云凭证的文件和方法

- 在 api/edu下新建upload.js文件,用于封装获取七牛云token的方法

- 在接口文档中查找七牛云管理接口请求方式

  ```js
  // api/edu/upload.js
  
  import request from '@/utils/request'
  //获取七牛云上传token
  export function reqGetUploadToken() {
    return request({
      url: `/uploadtoken`,
      method: 'GET'
    })
  }
  ```

  

#### 请求/管理token

```js
// token 的有效期是两个小时

// 初始获取上传需要的token
useEffect(() => {
  getUploadToken()

  return () => {
    subRef.current && subRef.current.unsubscribe()
  }
}, [])

/* 
获取上传需要的token
*/
const getUploadToken = async () => {
  let token = uploadToken
  let exp = expires
  if (!exp) {
    // 从本地读取数据，并解析成对象
      const data = JSON.parse(localStorage.getItem("upload_token")) || {}
      // 取出其中的token值和失效时间
      token = data.uploadToken
      exp = data.expires
  }
  
  // 如果在有效期内
  if (exp < Date.now()) {
    // 如果原本状态没有值, 保存token和expires
    if (!expires) {
      setUploadToken(token)
      setExpires(expires)
    }
  } else {
    // 如果有数据, 清除数据(数据已过期)
    if (exp) {
      setUploadToken('')
      setExpires('')
      localStorage.removeItem('upload_token')
    }
    // 请求获取token和expires数据
    const data = await reqUploadToken()
    // 将过期时间修正为时间数值, 并提前一点
    data.expires = Date.now() + expires * 1000 - 5 * 60 * 1000
    // 保存数据到state和local中
    setUploadToken(data.uploadToken)
    setExpires(data.expires)
    localStorage.setItem("upload_token", JSON.stringify(data))
  }
}

/* 
在提交上传请求前调用
可以返回布尔值或promise, 用于告知是否需要发请求
promise的方式用于检查中包含异步操作
如果是promise, 不发请求, 调用reject(), 如果是需要发请求, 调用resolve(file)
*/
const beforeUpload = (file, fileList) => {
  return new Promise((resolve, reject) => {
    // 如果文件超过了大小, 不提交请求
    if (file.size > MAX_VIDEO_SIZE) {
      message.warn('上传视频不能超过35mb')
      reject()
      return
    }

    // 获取到有效的token后, 才允许提交上传请求
    getUploadToken().then(() => resolve(file))
  })
}
```



#### 删除视频

```js
/* 
删除视频
*/
const onRemove = () => {
  // 上传取消
  subRef.current && subRef.current.unsubscribe()
  // 让表单保存video为''
  props.onChange("")
  // 标识没有上传成功的视频
  setIsUploadSuccess(false)
}
```



使用七牛

​	注册 & 登陆

​	上传身份证

​     创建一个存储对象: xxx

​	查看当前账号: AK / SK

​	在后台项目的配置中修改: 存储对象名 / SK / SK

​	const ACCESS_KEY = "E7nFXkXGiqs5RxkOPFOGprfPN2SyyNDkwyk4CdLn";

​	const SECRET_KEY = "aFgqIUxJhkDrWyDaqxfOF9a67hEQi0GmqVzlJ8QC";

​	const BUCKET = "atguigu-200317"; // 对象存储的标识名称



### 全屏功能

- 下载

```
yarn add screenfull
```

- 标识需要进行全屏的div

```jsx
export default function Chapter () {

  const fullscreenRef = useRef()

  return (
    <div ref={fullscreenRef}>
      <Search/>
      <List fullscreenRef={this.fullscreenRef}/>
    </div>
  )
}
```

- 切换全屏

```jsx
import screenfull from 'screenfull'

const [isScreenFull, setIsScreenFull] = useState(false)

useEffect(() => {
    // 绑定改变的监听
    screenfull.onchange(() => {
        // 保存当前是否全屏状态
        setIsScreenFull(screenfull.isFullscreen)
    })
}, [])

/* 
点击切换全屏
*/
const toggleFullScreen = () => {
  const dom = fullscreenRef.current
  screenfull.toggle(dom) // 切换全屏
}

<Tooltip title="全屏">
    {
        isScreenFull
        ? <FullscreenExitOutlined onClick={toggleFullScreen} />
        : <FullscreenOutlined onClick={toggleFullScreen} />
	}
</Tooltip>
```

- **解决全屏bug1: 底部有黑色部分**
  - 原因: 列表的高度不够

```css
.chapter-list {
  min-height: 100%;
}
```

- **解决bug2: 全屏时下拉列表不显示**
  - 原因: 默认下拉列表是动态插入body中显示的, 全屏时只显示当前路由组件界面
  - 解决: 指定插入在表单内显示

```jsx
<Select 
	getPopupContainer={triggerNode => triggerNode.parentNode}
>
```



## Modal与Form配合使用的问题(面试说)

```jsx
功能: 利用Modal + Form实现多条数据项的修改?
 问题1: 
    描述: 表单项中总是显示第一次指定的数据项值
    原因: initialValues来动态指定表单项的初始默认值, 但它只会显示第一次指定的值(Form一直在复用)
    	initialValues={{ // 初始值只会显示第一次显示指定的值
           title: chapter.title
        }}
    解决: 显示对话框时, 通过setFieldsValue()来指定表单项的初始值
    	setIsShowAdd(true)
        form.setFieldsValue({
            title: record.title
        })
 问题2: 
    描述: 第一次显示对话框时,会报错: form没有传入到<Form>的props中, 但我们传了
    原因: Modal和Form组件对象都还没有创建
    
 不行的解决办法: 在Modal显示之后才执行
     useEffect(() => { 
        if (isShowAdd && chapterRef.current) {
          form.setFieldsValue({ // form组件对象还没有创建
            title: chapterRef.current.title
          })
        }
      }, [isShowAdd])
    
   原因: Modal组件对象创建时, 不会立即创建内部的Form组件对象, 后面异步创建的Form (Modal创建了, 但Form组件对象没有创建)
    
可行的解决办法1: 利用定时器
     useEffect(() => { 
        if (isShowAdd && chapterRef.current) {
          setTimeout(() => { // 此时Form组件已经创建了
            form.setFieldsValue({
              title: chapterRef.current.title
            })
          })
        }
      }, [isShowAdd])
可行的解决办法2: 让Modal初始不显示时就创建出来(内部的form也会创建出来)
    <Modal getContainer={false}>
        
 getContainer={false}的作用:
    1) Modal的界面从默认的body中转移到当前所有标签中
    2) 会立即创建Dodal组件其及内部的Form组件对象, 只是不显示而已
    相当于预创建了, 而默认是第一次需要显示时才创建(懒创建)
```



## 其它功能

```
1. 课程管理
2. 讲师管理
3. 权限相关管理
4. 登陆
5. 可视化图表
```

