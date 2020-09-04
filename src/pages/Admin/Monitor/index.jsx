import React, { Component } from "react"
import { Tabs, Row, Col,DatePicker } from "antd"
import { Chart, Geom, Axis, Tooltip} from "bizcharts"

import "./index.less"

const { RangePicker } = DatePicker
const { TabPane } = Tabs

export default class Monitor extends Component {

  render() {

    const data = [
      {
        month: "1月",
        sales: 38,
      },
      {
        month: "2月",
        sales: 52,
      },
      {
        month: "3月",
        sales: 61,
      },
      {
        month: "4月",
        sales: 145,
      },
      {
        month: "5月",
        sales: 148,
      },
      {
        month: "6月",
        sales: 160,
      },
      {
        month: "7月",
        sales: 111,
      },
      {
        month: "8月",
        sales: 133,
      },
      {
        month: "9月",
        sales: 122,
      },
      {
        month: "10月",
        sales: 158,
      },
      {
        month: "11月",
        sales: 79,
      },
      {
        month: "12月",
        sales: 88,
      },
    ]

    return (
      <div className="monitor-wrap">
        <Tabs
          defaultActiveKey="1"
          tabBarExtraContent={<RangePicker/>}
        >
          <TabPane tab="销售量" key="1">
            <Row justify="space-between">
              <Col span={24}>
                <Chart
                  height={350}
                  data={data}
                  forceFit
                  style={{ marginLeft: -40, marginBottom: -50 }}
                >
                  <h3 className="main-title" style={{ marginLeft: 50 }}>
                    销售业绩
                  </h3>
                  <Axis/>
                  <Tooltip
                    crosshairs={{
                      type: "y",
                    }}
                  />
                  <Geom type="interval" position="month*sales" />
                </Chart>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="访问量" key="2">
            <Row justify="space-between">
              <Col span={24}>
                <Chart
                  height={350}
                  data={data}
                  forceFit
                  style={{ marginLeft: -40, marginBottom: -50 }}
                >
                  <h3 className="main-title" style={{ marginLeft: 50 }}>
                    访问量
                  </h3>
                  <Axis name="month" />
                  <Axis name="sales" />
                  <Tooltip
                    crosshairs={{
                      type: "y",
                    }}
                  />
                  <Geom type="interval" position="month*sales" />
                </Chart>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
