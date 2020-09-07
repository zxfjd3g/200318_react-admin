/* 
包含同步和异步action的模块
*/
import {
  GET_ALL_COURSE_LIST,
  GET_CHAPTER_LIST,
} from './constants'
import {
  reqAllCourseList
} from '@/api/edu/course'
import {
  reqChapterList
} from '@/api/edu/chapter'


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
    return allCourseList
  }
}

/* 
获取指定课程下的章节分页列表
*/
const getChapterListSync = ({courseId, page, pageSize, chapterList}) => ({ 
  type: GET_CHAPTER_LIST, 
  data: {courseId, page, pageSize, chapterList}
}) 

export const getChapterList = ({ page, pageSize, courseId }) => {
  return dispatch => {
    return reqChapterList({ page, pageSize, courseId })
      .then((chapterList) => {
        dispatch(getChapterListSync({courseId, page, pageSize, chapterList}))
        return chapterList
      })
  }
}