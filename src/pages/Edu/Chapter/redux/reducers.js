/* 
管理状态数据的reducer函数
*/

import {
  GET_ALL_COURSE_LIST,
  GET_CHAPTER_LIST
} from './constants'

const initChapter = {
  allCourseList: [], // 所有课程列表
  courseId: '',  // 当前课程的id
  pageSize: 3, // 每页数量
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
    case GET_CHAPTER_LIST:
      const {courseId, pageSize, chapterList} = action.data
      return {...preState, courseId, chapterList, pageSize}
      // return {allCourseList: preState.allCourseList, courseId, chapterList}
    default:
      return preState;
  }
}