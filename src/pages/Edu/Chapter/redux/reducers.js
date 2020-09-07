/* 
管理状态数据的reducer函数
*/

import {
  GET_ALL_COURSE_LIST
} from './constants'

const initChapter = {
  allCourseList: [], // 所有课程列表
  courseId: '',  // 当前课程的id
  chapterList: { // 章节分页数据
    total: 0,	// 总数量
    items: [], // 当前页的数组
  }
}
export default function chapter (preState = initChapter, action) {
  switch (action.type) {
    case GET_ALL_COURSE_LIST:
      const allCourseList = action.data
      return {...preState, allCourseList}
    default:
      return preState;
  }
}