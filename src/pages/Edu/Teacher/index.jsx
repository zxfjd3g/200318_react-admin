import React, { Component, createRef } from "react"
import { Button, message, Tooltip, Modal } from "antd"
import {
  PlusOutlined,
  FormOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import dayjs from 'dayjs'

import Table from "@/components/Table"
import SearchForm from "./components/SearchForm"
import { reqTeacherList } from "@/api/edu/teacher"


class Teacher extends Component {
  
  state = {
    selectedRowKeys: [],
    tableLoading: false,
    page: 1,
    limit: 10, 
    teacherList: [],
    total: 0,
    previewVisible: false,
    previewImage: "",
  }

  searchValues = {}

  containerRef = createRef()

  showImgModal = (img) => {
    return () => {
      this.setState({
        previewVisible: true,
        previewImage: img,
      })
    }
  }

  handleImgModal = () => {
    this.setState({
      previewVisible: false,
    })
  }

  columns = [
    {
      title: "序号",
      dataIndex: "index",
      key: 'index',
      width: 70,
    },
    {
      title: "讲师姓名",
      dataIndex: "name",
      key: 'name',
      width: 100,
    },
    {
      title: "头像",
      dataIndex: "avatar",
      key: 'avatar',
      width: 120,
      render: (img) => (
        <img
          onClick={this.showImgModal(img)}
          style={{ width: 50, height: 40, cursor: "pointer" }}
          src={img}
          alt="头像"
        />
      ),
    },
    {
      title: "详细介绍",
      dataIndex: "intro",
      key: 'intro',
      ellipsis: true,
      width: 300,
    },
    {
      title: "简介",
      dataIndex: "career",
      key: 'career',
      width: 100,
    },
    {
      title: "讲师级别",
      dataIndex: "level",
      key: 'level',
      render: (level) => {
        return level === 1 ? "高级讲师" : "首席讲师"
      },
      width: 100,
    },
    {
      title: "创建时间",
      dataIndex: "gmtCreate",
      key: 'gmtCreate',
      render: (gmtCreate) => dayjs(gmtCreate).format('YYYY年MM月DD日 HH:mm:ss'),
      width: 220,
    },
    {
      title: "操作",
      key: 'action',
      render: () => (
        <>
          <Tooltip title="更新">
            <Button type="primary">
              <FormOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Button type="danger" style={{ marginLeft: 10 }}>
              <DeleteOutlined />
            </Button>
          </Tooltip>
        </>
      ),
      width: 120,
      fixed: 'right',
    },
  ]

  componentDidMount() {
    this.getTeachList()
  }

  getTeachList = (page=this.state.page, limit = this.state.limit) => {
    
    this.setState({
      page,
      limit,
      tableLoading: true,
    })

    const {
      name,
      level,
      gmtCreateBegin,
      gmtCreateEnd,
    } = this.searchValues

    return reqTeacherList({
      page,
      limit,
      name,
      level,
      gmtCreateBegin,
      gmtCreateEnd,
    }).then((teachers = {}) => {
      const { total, items } = teachers

      if (total===0) {
        this.setState({
          page: 1,
          teacherList: [],
          total,
        })
        message.warning("没有匹配的讲师")
        return
      }

      this.setState({
        teacherList: items.map((item, index) => ({
          ...item,
          index: index + 1,
        })),
        total,
      })

      message.success("获取讲师分页列表数据成功")
    }).finally(() => {
      this.setState({
        tableLoading: false,
      })
    })
  }

  search =  (searchValues) => {
    this.searchValues = searchValues
    this.getTeachList(1)
  }

  refresh = () => {
    const { page, limit } = this.state
    this.handleTableChange({ page, limit }).then(() => {
      message.success("刷新数据成功！")
    })
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys,
    })
  }

  render() {
    const {
      tableLoading,
      page,
      limit,
      teacherList,
      total,
      previewVisible,
      previewImage,
      selectedRowKeys
    } = this.state

    const extra = [
      <Button type="primary" key="1">
        <PlusOutlined />
        <span>新增</span>
      </Button>,
      <Button type="danger" style={{ marginLeft: 10 }} key="2">
        <span>批量删除</span>
      </Button>
    ]

    return (
      <div ref={this.containerRef} style={{ backgroundColor: "#f5f5f5" }}>
        <SearchForm
          search={this.search}
        />
        <Table
          title="讲师数据列表"
          scroll={{ x: 1400}}
          container={this.containerRef}
          onRefresh={this.refresh}
          extra={extra}
          columns={this.columns}
          dataSource={teacherList}
          rowKey="_id"
          selectedRowKeys={selectedRowKeys}
          onSelectChange={this.onSelectChange}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "30", "40", "50", "100"],
            onChange: this.getTeachList,
            onShowSizeChange: (page, pageSize) => this.getTeachList(1, pageSize),
          }}
          loading={tableLoading}
        />
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handleImgModal}
        >
          <img alt="example" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      </div>
    )
  }
}

export default Teacher
