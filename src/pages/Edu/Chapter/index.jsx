/* 
章节管理路由组件
*/
import React from 'react'

import Search from './components/Search'
import List from './components/List'

export default function Chapter (props) {
  return (
    <div>
      <Search/>
      <List/>
    </div>
  )
}
