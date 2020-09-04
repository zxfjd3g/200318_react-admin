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
4. **初始化 / 重置** 本地数据库数据: **npm run reset**
5. 指定前端项目代理的目标服务器地址为:  http://localhost:5000
   - package.json --> proxy --> http://localhost:5000





**mongoimport --db react_admin --collection chapters --file D:\work\React项目\代码\react-admin-server_final\test\dbs\react_admin.chapters.json**



### 开发组件流程(新建分类组件演示)

1. 新建路由组件Subject
2. 在config/asyncComps.js中引入
3. 在页面中权限管理/菜单管理中添加
   1. 菜单名: 分类管理
   2. 访问路径 /subject/list
   3. 组件名称: Subject



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

  -  table的可展开与树形数据展示例子
  -  table的expandable属性配置
     -  expandedRowKeys: 展开行的key的数组, 控制属性
     -  onExpandedRowsChange: 展开的行变化时触发
     -  onExpand: 点击展开图标时触发

- 如何带展开图标?

  ```javascript
  // 让每个一级分类对象都有一个children数组属性 ==> 带展开图标
  subjectList.items.forEach(item => item.children = [])
  ```

- 配置table的expandable属性

  -  动态加载/请求二级分类列表显示
  -  如果没有二级分类, 去掉展开图标

  ```javascript
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
  展开行变化时触发
  expandedRowKeys: 所有展开行的id数组
  */
  handleExpandedRowsChange = (expandedRowKeys) => {
    // 更新到状态中
    this.setState({
      expandedRowKeys
    })
  }
  
  /* 
  点击展开图标触发
  expanded: 是否是打开
  record: 
  */
  handleExpand = async (expanded, record) => {
  
    if (expanded) {
      const data = await reqAllSubSubjectList(record._id)
      const cItems = data.items
      
      // 方式一: 直接修改state数据对象内部数据, 再setState更新状态
      /* 
      if (cItems.length===0) {
        delete record.children
        message.info('没有一个子分类')
      } else {
        record.children =  cItems
      }
      this.setState({
        subjectList: {...this.state.subjectList}
      })
      */
  
      // 方式二: 不直接修改state数据, 完全产生一个新数据来setState更新
      const items = this.state.subjectList.items
      const newItems = items.map(item => {
        if (record._id===item._id) {
          // 如果子分类没有, 删除children属性(不要直接删除)
          if (cItems.length===0) {
            message.info('没有一个子分类')
            const {children, ...restItem} = item
            return restItem
          }
          return {
            ...item,
            children: cItems
          }
        }
        return item
      })
      this.setState({
        subjectList: {
          ...this.state.subjectList,
          items: newItems
        }
      })
    }
  }
  ```



### 添加分类

- 设计状态

```javascript
isShowAdd: false, // 是否显示添加界面
confirmLoading: false, // 是否显示确定按钮的loading
```

- 添加界面

```javascript
<Modal
  title="添加分类"
  visible={isShowAdd}
  onOk={this.addSubject}
  confirmLoading={confirmLoading}
  onCancel={() => {
    // 重置表单
    this.formRef.current.resetFields()
    this.setState({
      isShowAdd: false,
    })
  }}
>
  <Form
    {...layout}
    ref={this.formRef}
  >
    <Form.Item
      label="父级分类"
      name="parentId"
      rules={[
        {
          required: true,
          message: '请选择父级分类',
        },
      ]}
    >
      <Select
        placeholder="请选择"
      >
        <Option key="0" value="0">一级分类</Option>
        {
          allSubjectList.map((subject) => {
            return (
              <Option key={subject._id} value={subject._id}>
                {subject.title}
              </Option>
            )
          })
        }
      </Select>
    </Form.Item>

    <Form.Item
      label="分类名称"
      name="title"
      rules={[
        {
          required: true,
          message: '请输入分类名称!',
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
<Button 
    type="primary" 
    icon={<PlusOutlined/>} 
    onClick={this.showAdd}>
    添加课程分类
</Button>

/* 
  显示添加界面
*/
showAdd = () => {
    this.setState({
        isShowAdd: true
    })
    this.getAllSubjectList()
}
  
```

- 请求添加分类

```javascript
/* 
添加分类
*/
addSubject = () => {
  const form = this.formRef.current
  // console.log(form)
  form.validateFields()
    .then(async values => {
      const { title, parentId } = values
      this.setState({confirmLoading: true})

      try {
        await reqAddSubject(title, parentId)
        this.setState({
          confirmLoading: false,
          isShowAdd: false
        })
        message.success('添加课程分类成功')
        this.getSubjectList(1)
      } catch (e) {
        this.setState({
          confirmLoading: false,
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

  ```javascript
/* 
Table的列配置 ==> 相当于elementUI的el-table-column
*/
columns = [
  {
    title: '分类名称',
    // key: "title",
    dataIndex: 'title',
    render: (title, record) => {
      const {subjectId, subjectTitle} = this.state
      if (subjectId===record._id) {
        return <Input
          defaultValue={title}
          ref={this.inputRef}
          className="edit_input"
          onChange={
            e => this.setState({
              subjectTitle: e.target.value.trim()
            })
          }
        />
      }
      return title
    }
  },
  {
    title: '操作',
    width: '30%',
    // key: "action",
    // 如果当前列不仅仅是直接显示对象的属性值, 就需要用render
    render: (record) => {
      if (record._id===this.state.subjectId) { // 待修改行
        return (
          <>
            <Button 
              type="primary" 
              size="small"
              className="edit_btn"
              onClick={() => this.handleConfirm(record)}
            >确定</Button>
            <Button 
              type="danger" 
              size="small"
              onClick={() => {
                this.setState({
                  subjectId: '',
                  subjectTitle: ''
                })
              }}
            >取消</Button>
          </>
        )
      } else { // 列表行
        return (
          <>
            <Tooltip title="修改分类">
              <Button 
                type="primary" 
                className="edit_btn" 
            	  icon={<EditOutlined/>}
                onClick={() => this.toEdit(record)}
              >
              </Button>
            </Tooltip>
            <Tooltip title="删除分类">
              <Button type="danger" icon={<DeleteOutlined/>}></Button>
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
/* 
变为编辑模式
*/
toEdit = (subject) => {
  // 如果有待处理的修改分类, 提示
  if (this.state.subjectId) {
    message.warn('请先保存修改的分类')
    return
  }

  // 当前行变为编辑模式, 并让输入框获得焦点
  this.setState({
    subjectId: subject._id,
    subjectTitle: subject.title
  }, () => this.inputRef.current.focus())
}
```



- 请求更新分类

```javascript
/* 
确定更新分类
*/
handleConfirm = async (subject) => {
  const {subjectId, subjectTitle} = this.state
  if (!subjectTitle) {
    message.warn('必须输入')
    this.inputRef.current.focus()
  } else if (subjectTitle===subject.title) {
    message.warn('名称没有变化')
    this.inputRef.current.focus()
  } else {
    await reqUpdateSubject(subjectId, subjectTitle)
    message.success('更新成功!')
    this.setState({
      subjectId: '',
      subjectTitle: '',
    })
    this.getSubjectList()
  }
}
```

### 删除分类

```javascript
/* 
删除指定分类
*/
removeSubject = (subject) => {
  // 显示确定框
  Modal.confirm({
    title: <>确定要删除 <span className="delete_show">{subject.title}</span> 吗?</>,
    icon: <ExclamationCircleOutlined />,
    content: '谨慎操作, 不可恢复!',
    onOk: async () => {
      // 提交删除的请求
      await reqDeleteSubject(subject._id)
      message.success('删除成功!')
      // 计算要重新获取的页码
      let {current, subjectList: {items}} = this.state
      if (current>1 && items.length===1) {
        current--
      }
      this.getSubjectList(current)
    },
    // onCancel() {
    //   console.log('Cancel')
    // },
  })
}
```



## 章节管理

### 定义相关接口请求函数



### 使用redux管理章节管理相关数据



### 章节管理路由组件



### 章节路由的子组件: Search组件



### 章节路由的子组件: List组件



### 添加课时路由组件: addLesson组件



### 上传视频的upload组件封装: 



#### 七牛云



#### 七牛云上传凭证需要修改的配置



#### 定义获取七牛云凭证的文件和方法



#### 请求/管理token



#### 封装请求/管理token的方法



#### 展示上传视频进度条



### 视频预览展示




### 全屏功能





## 课程管理

### 顶部搜索的功能



### 点击查询按钮,获取课程数据



### 动态渲染课程列表



## 国际化 

### react-intl -->国际化我们定义的数据



### 给头部的国际化按钮添加功能



### 国际化antd中定义的数据



## 用户登陆

### 实现表单校验-利用antd表单校验



### 账户名和密码登录



### 手机号登录

