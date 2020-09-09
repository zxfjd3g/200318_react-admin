import React from "react"
import { Form, Input, Button, Select, Row, Col, DatePicker } from "antd"
import "./index.less"

const { Option } = Select
const { RangePicker } = DatePicker

const layoutCol = {
  // <576px
  xs: 24,
  // ≥576px
  sm: 12,
  // ≥768px
  md: 12,
  // ≥992px
  lg: 8,
  // ≥1200px
  xl: 8,
  // ≥1600px
  xxl: 6,
}

function SearchForm({ search }) {
  const [form] = Form.useForm()

  const onFinish = (values) => {
    const { name, level, time } = values
    const gmtCreateBegin = time ? time[0].toISOString() : ''
    const gmtCreateEnd = time ? time[1].toISOString() : ''
    search({ name, level, gmtCreateBegin, gmtCreateEnd })
  }

  return (
    <div className="search-form">
      <Form layout="inline" form={form} onFinish={onFinish}>
        <Row gutter={[10, 20]} className="search-form-row">
          <Col {...layoutCol}>
            <Form.Item name="name" label="讲师名称">
              <Input placeholder="讲师名称" />
            </Form.Item>
          </Col>
          <Col {...layoutCol}>
            <Form.Item name="level" label="讲师级别">
              <Select placeholder="讲师级别" 
                getPopupContainer={triggerNode => triggerNode.parentNode}>
                <Option value={1}>高级讲师</Option>
                <Option value={2}>首席讲师</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col {...layoutCol}>
            <Form.Item name="time" label="创建时间">
              <RangePicker getPopupContainer={triggerNode => triggerNode.parentNode}/>
            </Form.Item>
          </Col>
          <Col {...layoutCol}>
            <Form.Item>
              <div>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button onClick={() => form.resetFields()} className="search-form-btn">
                  重置
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default SearchForm
