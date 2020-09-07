/* 
包含同步和异步action的模块
*/
import {
  GET_ALL_COURSE_LIST
} from './constants'
import {
  reqAllCourseList
} from '@/api/edu/course'
/* 
获取所有课程列表
*/
const getAllCourseListSync = (allCourseList) => ({type: GET_ALL_COURSE_LIST, data: allCourseList})
export const getAllCourseList = () => {
  return async dispatch => {
    // 执行异步请求
    const allCourseList = await reqAllCourseList()
    // 请求成功后, 分发同步action
    dispatch(getAllCourseListSync(allCourseList))
  }
}
