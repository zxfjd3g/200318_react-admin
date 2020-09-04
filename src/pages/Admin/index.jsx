import React, { Component } from "react"

import Analysis from "./Analysis"
import Monitor from "./Monitor"

export default class Admin extends Component {
  render() {
    return (
      <div>
        <Analysis />
        <Monitor />
      </div>
    )
  }
}
