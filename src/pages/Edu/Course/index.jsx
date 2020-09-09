import React, { Component } from "react"
import SearchForm from './components/SearchForm'
import List from './components/List'

/* 
课程管理
*/
export default class Course extends Component {
  
  render () {
    return (
      <>
        <SearchForm/>
        <List/>
      </>
    )
  }
}
