/* 
管理状态数据的reducer函数
*/

import {
  GET_ALL_COURSE_LIST,
  GET_CHAPTER_LIST
} from './constants'
import {DEFAULT_PAGE_SIZE} from '@/config/constants'

const initChapter = {
  allCourseList: [], // 所有课程列表
  courseId: '',  // 当前课程的id
  pageSize: DEFAULT_PAGE_SIZE, // 每页数量
  page: 1, // 当前页码
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
      const {courseId, page, pageSize, chapterList} = action.data
      // 给每个章节对象添加一个children数组
      chapterList.items.forEach(c => c.children = [])

      return {...preState, courseId, chapterList, pageSize, page}
      // return {allCourseList: preState.allCourseList, courseId, chapterList}
    default:
      return preState;
  }
}