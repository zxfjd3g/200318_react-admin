import React from "react"
import { Form, Select, Button } from "antd"

const { Option } = Select

function SearchForm() {
  const [form] = Form.useForm()

  const resetForm = () => {
    form.resetFields()
  }

  return (
    <Form layout="inline" form={form}>
      <Form.Item name="teacherId" label="课程">
        <Select
          allowClear
          placeholder="课程"
          style={{ width: 250, marginRight: 20 }}
        >
          <Option value="1">A</Option>
          <Option value="2">B</Option>
          <Option value="3">C</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ margin: "0 10px 0 30px" }}
        >
          查询评论
        </Button>
        <Button onClick={resetForm}>重置</Button>
      </Form.Item>
    </Form>
  )
}

export default SearchForm
