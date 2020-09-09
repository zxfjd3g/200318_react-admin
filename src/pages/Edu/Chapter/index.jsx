/* 
章节管理路由组件
*/
import React, {useRef} from 'react'

import Search from './components/Search'
import List from './components/List'

export default function Chapter (props) {

  const containerRef = useRef()

  return (
    <div ref={containerRef}>
      <Search/>
      <List containerRef={containerRef}/>
    </div>
  )
}
